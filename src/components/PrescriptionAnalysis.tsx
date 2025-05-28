
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill } from 'lucide-react';

interface PrescriptionAnalysisProps {
  analysis: string;
}

const PrescriptionAnalysis = ({ analysis }: PrescriptionAnalysisProps) => {
  const medicines = analysis.split(/\d+\.\s+/).filter(med => med.trim().length > 0);

  const formatMedicineInfo = (medicineText: string) => {
    const lines = medicineText.split('\n').map(line => line.trim()).filter(line => line);
    
    let name = '';
    let dose = '';
    let frequency = '';
    let timing = '';
    let instructions = '';

    lines.forEach(line => {
      if (line.includes('ওষুধের নাম') || (!name && !line.includes(':'))) {
        name = line.replace('ওষুধের নাম:', '').trim();
      } else if (line.includes('ডোজ:')) {
        dose = line.replace('ডোজ:', '').trim();
      } else if (line.includes('খাওয়ার নিয়ম:') || line.includes('দিনে')) {
        frequency = line.replace('খাওয়ার নিয়ম:', '').trim();
      } else if (line.includes('কখন খাবেন:') || line.includes('খাবার')) {
        timing = line.replace('কখন খাবেন:', '').trim();
      } else if (line.includes('অতিরিক্ত নির্দেশনা:') || line.includes('সতর্কতা:')) {
        instructions = line.replace(/অতিরিক্ত নির্দেশনা:|সতর্কতা:/, '').trim();
      }
    });

    return { name, dose, frequency, timing, instructions };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
          <Pill className="h-5 w-5" />
          প্রেসক্রিপশন
        </CardTitle>
      </CardHeader>
      <CardContent>
        {analysis.includes('প্রেসক্রিপশনের ব্যাখ্যা:') ? (
          <div className="space-y-3">
            {medicines.map((medicineText, index) => {
              const medicine = formatMedicineInfo(medicineText);
              
              return (
                <div key={index} className="p-3 border rounded-lg bg-gray-50">
                  <div className="space-y-1 text-sm">
                    <div className="font-semibold text-gray-800">
                      {medicine.name || `ওষুধ ${index + 1}`}
                    </div>
                    {medicine.dose && (
                      <div><span className="text-gray-600">ডোজ:</span> {medicine.dose}</div>
                    )}
                    {medicine.frequency && (
                      <div><span className="text-gray-600">নিয়ম:</span> {medicine.frequency}</div>
                    )}
                    {medicine.timing && (
                      <div><span className="text-gray-600">সময়:</span> {medicine.timing}</div>
                    )}
                    {medicine.instructions && (
                      <div><span className="text-gray-600">নির্দেশনা:</span> {medicine.instructions}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-gray-800 text-sm">
            {analysis}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrescriptionAnalysis;
