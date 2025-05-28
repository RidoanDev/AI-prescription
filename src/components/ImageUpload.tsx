
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
}

const ImageUpload = ({ onImageUpload }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "ফাইল খুব বড়",
          description: "১০MB এর চেয়ে ছোট ফাইল আপলোড করুন।",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      onImageUpload(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="space-y-4">
      <Card 
        {...getRootProps()} 
        className={`border-2 border-dashed cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <CardContent className="p-6 text-center">
          <input {...getInputProps()} />
          
          {preview ? (
            <div className="space-y-3">
              <img 
                src={preview} 
                alt="Prescription preview" 
                className="max-h-48 mx-auto rounded border"
              />
              <p className="text-green-600 font-medium">ছবি আপলোড সফল!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <p className="font-medium text-gray-700">
                  {isDragActive ? "ছবি এখানে ছেড়ে দিন" : "প্রেসক্রিপশনের ছবি আপলোড করুন"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  JPG, PNG, GIF, WebP (সর্বোচ্চ ১০MB)
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {fileRejections.length > 0 && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">
            {fileRejections[0].errors[0].code === 'file-too-large' 
              ? "ফাইল খুব বড়। ১০MB এর চেয়ে ছোট ফাইল আপলোড করুন।"
              : "অবৈধ ফাইল। ছবি ফাইল আপলোড করুন।"
            }
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
