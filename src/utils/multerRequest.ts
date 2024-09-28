interface MulterRequest extends Request {
    files?:
      | {
          [fieldname: string]: Express.Multer.File[]; 
        }
      | Express.Multer.File[];
  }


  export {MulterRequest}