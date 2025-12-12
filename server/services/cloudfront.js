import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import fs from 'fs';
import path from "path";

const __dirname = process.cwd();
const keyPath = path.join(__dirname, 'private_key.pem');

const privateKey = fs.readFileSync(keyPath, 'utf8');
const keyPairId = process.env.CLOUDFRONT_KEY_ID;
const dateLessThan = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // any Date constructor compatible
const distributionName = `https://d1n533sqdi8401.cloudfront.net`;

export const createCloudFrontGetSignedUrl = ({
  key,
  download = false,
  filename,
}) => {
  const url = `${distributionName}/${key}?response-content-disposition=${encodeURIComponent(`${download ? "attachment" : "inline"}; filename=${filename}`)}`;
  const signedUrl = getSignedUrl({
    url,
    keyPairId,
    dateLessThan,
    privateKey,
  });
  return signedUrl;
};

// https://bibwild.wordpress.com/2024/06/18/cloudfront-in-front-of-s3-using-response-content-disposition/