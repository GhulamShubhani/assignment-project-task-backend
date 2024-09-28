import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

(async function() {
    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });    
})();

const CloudinaryUploadFunction = async (localpath:any)=>{
    // Upload an image
    try {
        if(!localpath) return null;
        const uploadResult = await cloudinary.uploader
        .upload(
            localpath, {
                public_id: 'user-Avtar',
            }
        )
        .catch((error) => {
            console.log(error);
        });
    
        console.log(uploadResult);
        fs.unlinkSync(localpath)
        return  uploadResult?.secure_url ? uploadResult?.secure_url : uploadResult?.url
    } catch (error) {
        fs.unlinkSync(localpath);
        console.log(error); 
    }
 
}


export default CloudinaryUploadFunction




