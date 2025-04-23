import multer from "multer";
import path from "path";
import fs from "fs";

const uploadFilePernyataan = './uploads/files/';

if (!fs.existsSync(uploadFilePernyataan)) {
    fs.mkdirSync(uploadFilePernyataan, {recursive: true});
}  

const storagePernyataan = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFilePernyataan);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() +"-" + (file.originalname);
    cb(null, filename);
    console.log('filename: ', filename);
    console.log('Path extname: ', path.extname(file.originalname));
    console.log('file originalname: ', file.originalname);
  }
});

export const uploadPernyataan = (req, res) => {
    multer({
        storage: storagePernyataan,
        limits: {fileSize: 2 * 1024 * 1024 }, //limit 2MB
        fileFilter: (req, file, cb) => {
            if (file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('File harus berformat PDF.'));
            }
        },
    }).single('pdf-file')(req, res, function (error) {
        if(error) {
            return res.status(400).json({message: error.message});
        }
    
        const filePath = path.join("uploads/files", req.file.filename);
        console.log('Uploaded file path: ', filePath);
    
        res.status(200).json({message: 'Upload berhasil', filePath: filePath});
    });
};
  
