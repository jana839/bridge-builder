import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Clock, MapPin, Mail, MessageSquare, UserMinus, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Player {
  id: string;
  name: string;
  email: string;
  location: string;
  date: string;
  time: string;
  level: "Novice" | "Beginner" | "Intermediate" | "Advanced" | "Expert";
  notes?: string;
}

const PartnerFinder = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [removeDialog, setRemoveDialog] = useState<{ open: boolean; player: Player | null }>({
    open: false,
    player: null,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    date: "",
    time: "",
    level: "Beginner" as Player["level"],
    notes: "",
  });

  // Load players from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("bridgePlayers");
    if (stored) {
      setPlayers(JSON.parse(stored));
    }
  }, []);

  // Save players to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("bridgePlayers", JSON.stringify(players));
  }, [players]);

  // Remove expired players
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setPlayers((prev) =>
        prev.filter((player) => {
          const playerDateTime = new Date(`${player.date}T${player.time}`);
          return playerDateTime > now;
        })
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.location || !formData.date || !formData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newPlayer: Player = {
      id: Date.now().toString(),
      ...formData,
    };

    setPlayers([newPlayer, ...players]);
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      location: "",
      date: "",
      time: "",
      level: "Beginner",
      notes: "",
    });

    toast({
      title: "Posted Successfully!",
      description: "Your availability has been added to the list.",
    });
  };

  const handleRemove = (player: Player) => {
    setRemoveDialog({ open: true, player });
  };

  const confirmRemove = () => {
    if (removeDialog.player) {
      setPlayers(players.filter((p) => p.id !== removeDialog.player!.id));
      toast({
        title: "Listing Removed",
        description: "The player listing has been removed.",
      });
    }
    setRemoveDialog({ open: false, player: null });
  };

  const getLevelColor = (level: Player["level"]) => {
    const colors = {
      Novice: "bg-[#6B9F8E] text-white",
      Beginner: "bg-[#6B9F8E] text-white",
      Intermediate: "bg-[#C4914F] text-white",
      Advanced: "bg-[#2D5F4D] text-white",
      Expert: "bg-white text-[#C4914F] border-2 border-[#C4914F]",
    };
    return colors[level];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-[#2D5F4D] text-white py-20 px-4 relative overflow-hidden">
        {/* Large decorative card symbols in background */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <span className="absolute text-[200px] top-0 left-10">♠</span>
          <span className="absolute text-[180px] top-20 left-[30%]">♥</span>
          <span className="absolute text-[200px] bottom-10 right-10">♦</span>
          <span className="absolute text-[180px] top-10 right-[25%]">♣</span>
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="flex justify-center gap-4 mb-6">
            <span className="text-3xl">♠</span>
            <span className="text-3xl">♥</span>
            <span className="text-3xl">♦</span>
            <span className="text-3xl">♣</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">Bridge Partner Finder</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-90">
            Looking for a bridge partner? Browse available players or post your availability to find your perfect match for your next game.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Players - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-[#C4914F]" />
              <h2 className="text-2xl font-bold">Available Players</h2>
              <span className="text-muted-foreground text-sm">({players.length} {players.length === 1 ? 'player' : 'players'})</span>
            </div>

            {players.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No players currently seeking partners. Be the first to post!</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {players.map((player) => (
                  <Card key={player.id} className="p-6 relative bg-white border border-gray-200 rounded-lg shadow-sm">
                    {/* Level Badge - Top Right */}
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(player.level)}`}>
                      {player.level}
                    </div>

                    <div className="space-y-2 pr-24">
                      {/* Name */}
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <h3 className="text-xl font-semibold text-gray-900">{player.name}</h3>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{new Date(player.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{player.time}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{player.location}</span>
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${player.email}`} className="text-sm text-[#C4914F] hover:underline">
                          {player.email}
                        </a>
                      </div>

                      {/* Notes */}
                      {player.notes && (
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-500 italic">{player.notes}</span>
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(player)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-4 pt-3 border-t border-gray-100 w-full"
                      >
                        <UserMinus className="w-4 h-4" />
                        <span className="text-sm">Partner no longer needed</span>
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Post Your Availability Form - 1/3 width */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-[#C4914F]" />
                <h2 className="text-lg font-bold">Post Your Availability</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="City or venue name"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="level">Playing Level *</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData({ ...formData, level: value as Player["level"] })}
                  >
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Novice">Novice</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional details (preferred conventions, online/in-person, etc.)"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Post Availability
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </main>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={removeDialog.open} onOpenChange={(open) => setRemoveDialog({ open, player: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Removal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this listing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PartnerFinder;
