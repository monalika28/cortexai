/*import { PutObjectCommand } from "@aws-sdk/client-s3"
import { s3 } from "../config/s3.js"

export const uploadToS3=async (filename,buffer,contentType)=>{
 await s3.send(
    new PutObjectCommand({
        Bucket:process.env.AWS_BUCKET_NAME,
        Body:buffer,
        Key:filename,
        ContentType:contentType
    })

 )

 return filename
}*/

/*import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const UPLOAD_DIR = path.join(__dirname, "..", "uploads")

export const uploadToS3 = async (filename, buffer, contentType) => {
  await fs.promises.mkdir(UPLOAD_DIR, { recursive: true })
  await fs.promises.writeFile(path.join(UPLOAD_DIR, path.basename(filename)), buffer)
  return filename
}*/

import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

export const uploadToS3 = async (filename, buffer, contentType) => {
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: "raw", public_id: filename, overwrite: true, type: "upload" },
        (err, res) => (err ? reject(err) : resolve(res))
      )
      .end(buffer)
  })
  return result.secure_url
}