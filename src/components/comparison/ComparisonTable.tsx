
import { Business } from '@/hooks/useBusinesses';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import VerificationBadge from '@/components/verification/VerificationBadge';

interface ComparisonTableProps {
  businesses: Business[];
}

const renderValue = (value: any) => {
    if (typeof value === 'boolean') {
        return value ? <Check className="text-green-500 w-5 h-5" /> : <X className="text-red-500 w-5 h-5" />;
    }
    if (Array.isArray(value) && value.length > 0) {
        return (
            <div className="flex flex-wrap gap-1 max-w-xs mx-auto">
                {value.map((item, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300">
                      {item}
                    </Badge>
                ))}
            </div>
        );
    }
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        return <span className="text-gray-500">-</span>;
    }
    return String(value);
};

const ComparisonTable = ({ businesses }: ComparisonTableProps) => {
    const features = [
        { key: 'category', label: 'Category' },
        { key: 'location', label: 'Location' },
        { key: 'founded_year', label: 'Founded Year' },
        { key: 'employees_count', label: 'Employees' },
        { key: 'rating', label: 'Rating' },
        { key: 'project_budget_min', label: 'Min Project Budget', format: (val: number) => val ? `$${val.toLocaleString()}` : null },
        { key: 'project_budget_max', label: 'Max Project Budget', format: (val: number) => val ? `$${val.toLocaleString()}` : null },
        { key: 'tags', label: 'Tags' },
        { key: 'certifications', label: 'Certifications' },
        { key: 'verified', label: 'Verified' },
    ];
    
    return (
        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table className="text-white min-w-[800px]">
                        <TableHeader className="hover:bg-gray-800/50">
                            <TableRow className="border-gray-700">
                                <TableHead className="font-semibold text-base text-white sticky left-0 bg-gray-900 z-10 w-48 align-top pt-4">Feature</TableHead>
                                {businesses.map(b => (
                                    <TableHead key={b.id} className="text-center w-64">
                                        <div className="flex flex-col items-center gap-2 p-2">
                                            {b.logo_url ? (
                                                <img src={b.logo_url} alt={`${b.businessname} logo`} className="w-16 h-16 rounded-lg object-cover border-2 border-gray-700" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center border-2 border-gray-700">
                                                    <span className="text-2xl font-bold">{b.businessname?.charAt(0)}</span>
                                                </div>
                                            )}
                                            <span className="font-semibold text-white mt-2">{b.businessname}</span>
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {features.map(feature => (
                                <TableRow key={feature.key} className="border-gray-700 hover:bg-gray-800/50">
                                    <TableCell className="font-medium sticky left-0 bg-gray-900 z-10">{feature.label}</TableCell>
                                    {businesses.map(b => {
                                        const value = b[feature.key as keyof Business];
                                        if (feature.key === 'verified') {
                                            return (
                                                <TableCell key={b.id} className="text-center">
                                                    <div className="flex justify-center">
                                                        <VerificationBadge businessId={b.id} isVerified={!!b.verified} />
                                                    </div>
                                                </TableCell>
                                            );
                                        }

                                        const formattedValue = feature.format ? feature.format(value as any) : value;

                                        return (
                                            <TableCell key={b.id} className="text-center align-top py-4">
                                                {renderValue(formattedValue)}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default ComparisonTable;
