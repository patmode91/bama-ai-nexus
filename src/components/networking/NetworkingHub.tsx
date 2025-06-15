
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  MessageCircle, 
  UserPlus, 
  Star,
  MapPin,
  Briefcase,
  Calendar
} from 'lucide-react';

interface NetworkingMember {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  industry: string;
  avatar?: string;
  rating: number;
  isOnline: boolean;
  expertise: string[];
  joinedDate: string;
}

const mockMembers: NetworkingMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'CEO & Founder',
    company: 'TechStart Alabama',
    location: 'Birmingham, AL',
    industry: 'Technology',
    rating: 4.9,
    isOnline: true,
    expertise: ['AI', 'Machine Learning', 'Startups'],
    joinedDate: '2023-01-15'
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'Manufacturing Director',
    company: 'Alabama Steel Works',
    location: 'Huntsville, AL',
    industry: 'Manufacturing',
    rating: 4.7,
    isOnline: false,
    expertise: ['Supply Chain', 'Operations', 'Quality Control'],
    joinedDate: '2022-08-20'
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    title: 'Healthcare Innovation Lead',
    company: 'UAB Medical Center',
    location: 'Birmingham, AL',
    industry: 'Healthcare',
    rating: 4.8,
    isOnline: true,
    expertise: ['Telemedicine', 'Healthcare IT', 'Medical Devices'],
    joinedDate: '2023-03-10'
  },
  {
    id: '4',
    name: 'David Thompson',
    title: 'Agricultural Consultant',
    company: 'AgroTech Solutions',
    location: 'Mobile, AL',
    industry: 'Agriculture',
    rating: 4.6,
    isOnline: false,
    expertise: ['Sustainable Farming', 'AgTech', 'Crop Management'],
    joinedDate: '2022-11-05'
  }
];

const NetworkingHub = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [filteredMembers, setFilteredMembers] = useState(mockMembers);

  const industries = ['All', 'Technology', 'Healthcare', 'Manufacturing', 'Agriculture', 'Finance', 'Retail'];

  React.useEffect(() => {
    let filtered = mockMembers;

    if (selectedIndustry && selectedIndustry !== 'All') {
      filtered = filtered.filter(member => member.industry === selectedIndustry);
    }

    if (searchQuery) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.expertise.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredMembers(filtered);
  }, [searchQuery, selectedIndustry]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Professional Networking Hub</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Connect with Alabama's top business professionals. Build meaningful relationships, 
          share expertise, and discover collaboration opportunities.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search professionals by name, company, or expertise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto">
          {industries.map((industry) => (
            <Badge
              key={industry}
              variant={selectedIndustry === industry ? 'default' : 'secondary'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedIndustry(industry)}
            >
              {industry}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">1,247</div>
            <div className="text-sm text-gray-600">Active Members</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MessageCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">3,492</div>
            <div className="text-sm text-gray-600">Connections Made</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Briefcase className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">156</div>
            <div className="text-sm text-gray-600">Active Collaborations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">42</div>
            <div className="text-sm text-gray-600">Upcoming Events</div>
          </CardContent>
        </Card>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    {member.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <p className="text-sm text-gray-600">{member.title}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {renderStars(member.rating)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase className="w-4 h-4 mr-2" />
                  {member.company}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {member.location}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Expertise:</p>
                <div className="flex flex-wrap gap-1">
                  {member.expertise.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {member.expertise.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{member.expertise.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  <UserPlus className="w-4 h-4 mr-1" />
                  Connect
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or browse all members.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NetworkingHub;
