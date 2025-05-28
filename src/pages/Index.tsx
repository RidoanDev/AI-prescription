import { useState } from 'react';
import { FileText, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUpload from '@/components/ImageUpload';
import PrescriptionAnalysis from '@/components/PrescriptionAnalysis';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    setAnalysis('');
    toast({
      title: "ছবি আপলোড সফল",
      description: "এখন 'বিশ্লেষণ করুন' বাটনে ক্লিক করুন।",
    });
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(uploadedImage);
      });

      const response = await fetch('https://backend.buildpicoapps.com/aero/run/llm-api?pk=v1-Z0FBQUFBQm5HUEtMSjJkakVjcF9IQ0M0VFhRQ0FmSnNDSHNYTlJSblE0UXo1Q3RBcjFPcl9YYy1OZUhteDZWekxHdWRLM1M1alNZTkJMWEhNOWd4S1NPSDBTWC12M0U2UGc9PQ==', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Extract the prescription text from this image and explain it in Bengali using this EXACT format:

**প্রেসক্রিপশনের ব্যাখ্যা:**

For each medicine, follow this exact structure:
১. **[Medicine Name with strength]**
   - **ডোজ:** [dosage amount]
   - **খাওয়ার নিয়ম:** [frequency per day]
   - **কতদিন:** [duration]
   - **কখন খাবেন:** [before/after meals]
   - **অতিরিক্ত নির্দেশনা:** [any special instructions]

Continue numbering for each medicine (১., ২., ৩., etc.)

At the end, always add:
⚠️ **যদি কোনো ওষুধ বা নির্দেশনা বুঝতে সমস্যা হয়, দয়া করে ডাক্তার বা ফার্মাসিস্টের সাথে পরামর্শ করুন।**

Important rules:
- If any information is unclear, write "স্পষ্ট নয়" for that field
- Keep all explanations brief and clear
- Use Bengali numbers (১, ২, ৩) for numbering
- Make medicine names bold with **
- Follow the exact format shown above`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: base64
                  }
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      console.log('API Response:', data);
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('API কোটা শেষ হয়ে গেছে। অনুগ্রহ করে পরে চেষ্টা করুন।');
        } else if (response.status === 401) {
          throw new Error('API কী সমস্যা আছে। অনুগ্রহ করে সেটিংস চেক করুন।');
        } else {
          throw new Error(`API ত্রুটি: ${response.status}`);
        }
      }
      
      if (data.message) {
        setAnalysis(data.message);
        toast({
          title: "বিশ্লেষণ সম্পূর্ণ",
          description: "আপনার প্রেসক্রিপশনের ব্যাখ্যা প্রস্তুত।",
        });
      } else {
        throw new Error('API থেকে সঠিক উত্তর পাওয়া যায়নি');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      
      let errorMessage = "প্রেসক্রিপশন বিশ্লেষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "ত্রুটি",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">প্রেসক্রিপশন সহায়ক</h1>
          <p className="text-gray-600">ইংরেজি প্রেসক্রিপশন বুঝুন সহজ বাংলায়</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              প্রেসক্রিপশন আপলোড করুন
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload onImageUpload={handleImageUpload} />
            
            {uploadedImage && (
              <div className="mt-4 text-center">
                <Button 
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      বিশ্লেষণ করা হচ্ছে...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      প্রেসক্রিপশন বিশ্লেষণ করুন
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {analysis && (
          <PrescriptionAnalysis analysis={analysis} />
        )}
      </div>
    </div>
  );
};

export default Index;
