import fs from 'fs';

export function readFileAsPromise(path: string, options: object): Promise<(string | Buffer)[]> {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(path, options);

    const chunks: (string | Buffer)[] = [];
    fileStream.on('data', (data) => {
      chunks.push(data);
    });

    fileStream.on('close', () => {
      resolve(chunks);
    });

    fileStream.on('error', (err) => {
      reject(err);
    });
  });
}
