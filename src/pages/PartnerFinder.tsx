import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Clock } from "lucide-react";

interface Partner {
  id: number;
  name: string;
  skill: string;
  location: string;
  availability: string;
  rating: number;
  bio: string;
}

const mockPartners: Partner[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    skill: "Advanced",
    location: "New York, NY",
    availability: "Weekends",
    rating: 4.8,
    bio: "Competitive player with 15 years experience. Love teaching and learning new strategies."
  },
  {
    id: 2,
    name: "James Chen",
    skill: "Intermediate",
    location: "San Francisco, CA",
    availability: "Evenings",
    rating: 4.5,
    bio: "Looking for a regular partner for weekly games. Patient and friendly."
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    skill: "Expert",
    location: "Chicago, IL",
    availability: "Flexible",
    rating: 4.9,
    bio: "Tournament player seeking serious partners. Strong bidding and defensive skills."
  },
  {
    id: 4,
    name: "Michael Thompson",
    skill: "Beginner",
    location: "Boston, MA",
    availability: "Afternoons",
    rating: 4.2,
    bio: "New to bridge and eager to learn. Looking for patient partners."
  },
  {
    id: 5,
    name: "Lisa Anderson",
    skill: "Advanced",
    location: "Seattle, WA",
    availability: "Weekdays",
    rating: 4.7,
    bio: "Analytical player who enjoys discussing hands. Prefer 2/1 system."
  },
  {
    id: 6,
    name: "David Park",
    skill: "Intermediate",
    location: "Austin, TX",
    availability: "Weekends",
    rating: 4.4,
    bio: "Social player looking for fun games. Always up for post-game analysis."
  }
];

const PartnerFinder = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const filteredPartners = mockPartners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = !selectedSkill || partner.skill === selectedSkill;
    return matchesSearch && matchesSkill;
  });

  const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl text-muted-foreground">♠</span>
            <h1 className="text-xl font-semibold text-foreground">
              Bridge Partner Finder
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSkill === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSkill(null)}
            >
              All Levels
            </Button>
            {skillLevels.map(level => (
              <Button
                key={level}
                variant={selectedSkill === level ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSkill(level)}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        {/* Partner Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPartners.map(partner => (
            <Card key={partner.id} className="p-5">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {partner.name}
                    </h3>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-sm">{partner.rating}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">{partner.skill}</Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  {partner.bio}
                </p>

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{partner.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{partner.availability}</span>
                  </div>
                </div>

                <Button className="w-full" size="sm">
                  Connect
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredPartners.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No partners found matching your criteria.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PartnerFinder;
