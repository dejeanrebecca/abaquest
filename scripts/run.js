import { spawn } from 'child_process';
import { platform } from 'os';

const args = process.argv.slice(2);
const type = args[0]; // 'deploy' or 'check'
const env = args[1] || 'dev'; // for deploy

const isWin = platform() === 'win32';

let cmd, cmdArgs;

if (type === 'deploy') {
    if (isWin) {
        cmd = 'powershell';
        cmdArgs = ['-File', './deploy.ps1', '-Environment', env];
    } else {
        cmd = 'sh';
        cmdArgs = ['./deploy.sh', env];
    }
} else if (type === 'check') {
    if (isWin) {
        cmd = 'powershell';
        cmdArgs = ['-ExecutionPolicy', 'Bypass', '-File', './scripts/check-env.ps1'];
    } else {
        cmd = 'sh';
        cmdArgs = ['./scripts/check-env.sh'];
    }
}

if (cmd) {
    console.log(`> Running ${type} on ${platform()}...`);
    const child = spawn(cmd, cmdArgs, { stdio: 'inherit' });
    child.on('exit', (code) => process.exit(code));
} else {
    console.error('Invalid command type. Use "deploy" or "check".');
    process.exit(1);
}
