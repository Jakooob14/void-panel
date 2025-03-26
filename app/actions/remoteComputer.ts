'use server';

import os from 'node:os';
import { exec } from 'node:child_process';
import { GeneralPermissions, isAllowed } from '@/app/utilities/permissions';

export async function getIsOnline(): Promise<boolean> {
  if (!(await isAllowed(GeneralPermissions.accessRemoteComputer))) throw new Error('Unauthorized');

  const pingCommand = os.platform() === 'win32' ? 'ping 192.168.0.234 -n 1' : 'ping 192.168.0.234 -c 1';

  return new Promise((resolve, reject) => {
    exec(pingCommand, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        resolve(false);
        return;
      }

      if (stderr) {
        console.log(`stderr: ${stderr}`);
        resolve(false);
        return;
      }

      if (stdout.includes('Reply from 192.168.0.234: Destination host unreachable.')) {
        console.log('Offline');
        resolve(false);
        return;
      }

      resolve(true);
    });
  });
}

export async function startComputer(): Promise<boolean> {
  if (!(await isAllowed(GeneralPermissions.accessRemoteComputer))) throw new Error('Unauthorized');

  return new Promise((resolve, reject) => {
    exec('sh ./app/commands/wol.sh', (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        resolve(false);
        return;
      }

      if (stderr) {
        console.log(`stderr: ${stderr}`);
        resolve(false);
        return;
      }

      if (stdout.includes('Sending magic packet')) {
        resolve(true);
        return;
      }

      resolve(false);
    });
  });
}
