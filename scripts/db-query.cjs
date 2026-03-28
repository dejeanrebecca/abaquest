const { execSync } = require('child_process');
const https = require('https');

const args = process.argv.slice(2);
const env = args[0] || 'uat';
const searchName = args[1]; // optional

const PROJECT_ID = "abaquest";
const DATABASE_ID = env === 'prod' ? '(default)' : `database-${env}`;

async function query() {
    console.log(`\n🔍 Querying [${env}] environment (Database: ${DATABASE_ID})...\n`);

    try {
        // 1. Get access token from gcloud
        const token = execSync('gcloud auth print-access-token').toString().trim();

        // 2. Fetch documents from 'students' collection
        const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/students?pageSize=1000`;
        
        const data = await new Promise((resolve, reject) => {
            https.get(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            }, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => resolve(JSON.parse(body)));
                res.on('error', reject);
            });
        });

        if (data.error) {
            console.error(`❌ Error from Firestore: ${data.error.message}`);
            return;
        }

        const docs = data.documents || [];
        
        // 3. Calculate "This Week" (Starting Monday 00:00:00)
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
        monday.setHours(0, 0, 0, 0);

        let totalQuestsCompletedThisWeek = 0;

        const profiles = docs.map(doc => {
            const fields = doc.fields || {};
            const created = new Date(doc.createTime);
            
            // Extract quest progress for activity tracking
            const progress = fields.progress?.mapValue?.fields || {};
            const questProgressMap = progress.questProgress?.mapValue?.fields || {};
            
            Object.keys(questProgressMap).forEach(qId => {
                const qData = questProgressMap[qId].mapValue?.fields || {};
                const completedAt = qData.completedAt?.stringValue;
                if (completedAt) {
                    const compDate = new Date(completedAt);
                    if (compDate >= monday) {
                        totalQuestsCompletedThisWeek++;
                    }
                }
            });

            return {
                name: fields.name?.stringValue || 'Unknown',
                role: fields.role?.stringValue || 'student',
                id: doc.name.split('/').pop(),
                isNewThisWeek: created >= monday
            };
        });

        // 4. Calculate Stats
        const students = profiles.filter(p => p.role === 'student');
        const teachers = profiles.filter(p => !p.role || p.role === 'teacher' || p.role === 'admin');
        
        const newStudents = students.filter(p => p.isNewThisWeek);
        const newTeachers = teachers.filter(p => p.isNewThisWeek);

        console.log(`📊 Statistics:`);
        console.log(`   - Students: ${students.length} (${newStudents.length} added this week)`);
        console.log(`   - Teachers/Admins: ${teachers.length} (${newTeachers.length} added this week)`);
        console.log(`   - Total Profiles: ${profiles.length}`);

        console.log(`\n📅 Weekly Activity (Since Mon ${monday.toDateString()}):`);
        console.log(`   - New Students: ${newStudents.length}`);
        console.log(`   - New Teachers: ${newTeachers.length}`);
        console.log(`   - Quests Completed: ${totalQuestsCompletedThisWeek}`);

        // 4. Search for specific student
        if (searchName) {
            const found = profiles.filter(p => p.name.toLowerCase().includes(searchName.toLowerCase()));
            if (found.length > 0) {
                console.log(`\n👤 Search Result for "${searchName}":`);
                found.forEach(p => console.log(`   ✅ Found: ${p.name} (${p.role}) - ID: ${p.id}`));
            } else {
                console.log(`\n👤 Search Result for "${searchName}":`);
                console.log(`   ❌ Not found.`);
            }
        }

        console.log(`\n📈 Activity: (Historical activity tracking coming soon - requires 'activity' collection query)`);
        
    } catch (err) {
        console.error(`❌ Failed to query database: ${err.message}`);
        console.log(`   Make sure you are logged in: gcloud auth login`);
    }
}

query();
