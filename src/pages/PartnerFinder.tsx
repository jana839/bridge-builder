import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  email: string;
  location: string;
  date: string;
  time: string;
  level: "Novice" | "Beginner" | "Intermediate" | "Advanced" | "Expert";
  notes?: string;
  created_at?: string;
}

const PartnerFinder = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [removeDialog, setRemoveDialog] = useState<{ open: boolean; player: Player | null }>({
    open: false,
    player: null,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    locationOther: "",
    date: "",
    time: "12:30",
    level: "Beginner" as Player["level"],
    notes: "",
    event_link: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date>();

  // Load players from database and set up realtime subscription
  useEffect(() => {
    loadPlayers();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('partner_listings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partner_listings'
        },
        () => {
          loadPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_listings')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;

      // Filter out expired listings (date/time has passed)
      const now = new Date();
      const activePlayers = (data || []).filter((player) => {
        const listingDateTime = new Date(`${player.date}T${player.time}:00`);
        return listingDateTime > now;
      });

      setPlayers(activePlayers as Player[]);
    } catch (error) {
      console.error('Error loading players:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalLocation = formData.location === "Other" ? formData.locationOther : formData.location;
    
    if (!formData.name || !formData.email || !finalLocation || !formData.date || !formData.time) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.location === "Other" && !formData.locationOther.trim()) {
      toast.error("Please specify your location");
      return;
    }

    try {
      const { error } = await supabase
        .from('partner_listings')
        .insert([{
          name: formData.name,
          email: formData.email,
          location: finalLocation,
          date: formData.date,
          time: formData.time,
          level: formData.level,
          notes: formData.notes,
          event_link: formData.event_link || null,
        }]);

      if (error) throw error;

      // Reset form
      setFormData({
        name: "",
        email: "",
        location: "",
        locationOther: "",
        date: "",
        time: "12:30",
        level: "Beginner",
        notes: "",
        event_link: "",
      });
      setSelectedDate(undefined);

      toast.success("Your availability has been posted!");
    } catch (error) {
      console.error('Error posting listing:', error);
      toast.error('Failed to post listing');
    }
  };

  const handleRemove = (player: Player) => {
    setRemoveDialog({ open: true, player });
  };

  const confirmRemove = async () => {
    if (removeDialog.player) {
      try {
        const { error } = await supabase
          .from('partner_listings')
          .delete()
          .eq('id', removeDialog.player.id);

        if (error) throw error;

        toast.success("Listing removed");
      } catch (error) {
        console.error('Error removing listing:', error);
        toast.error('Failed to remove listing');
      }
    }
    setRemoveDialog({ open: false, player: null });
  };

  const getLevelColor = (level: Player["level"]) => {
    const colors = {
      Novice: "bg-badge-novice text-white",
      Beginner: "bg-badge-beginner text-white",
      Intermediate: "bg-badge-intermediate text-white",
      Advanced: "bg-badge-advanced text-white",
      Expert: "bg-badge-expert text-white",
    };
    return colors[level];
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="bg-[#3D6B5C] text-white py-20 px-4 relative overflow-hidden">
        {/* Large decorative card symbols in background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.08]">
          <span className="absolute text-[280px] top-[-40px] left-[5%]">♠</span>
          <span className="absolute text-[220px] top-[20px] left-[35%]">♥</span>
          <span className="absolute text-[260px] top-[-30px] right-[8%]">♦</span>
          <span className="absolute text-[240px] bottom-[-60px] right-[30%]">♣</span>
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="flex justify-center gap-4 mb-6">
            <span className="text-4xl text-[#C4914F]" style={{ WebkitTextStroke: '1.5px #C4914F', WebkitTextFillColor: 'transparent', fontWeight: 400 }}>♠</span>
            <span className="text-4xl text-[#C4914F]" style={{ WebkitTextStroke: '1.5px #C4914F', WebkitTextFillColor: 'transparent', fontWeight: 400 }}>♥</span>
            <span className="text-4xl text-[#C4914F]" style={{ WebkitTextStroke: '1.5px #C4914F', WebkitTextFillColor: 'transparent', fontWeight: 400 }}>♦</span>
            <span className="text-4xl text-[#C4914F]" style={{ WebkitTextStroke: '1.5px #C4914F', WebkitTextFillColor: 'transparent', fontWeight: 400 }}>♣</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 font-serif">Bridge Partner Finder</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-90">
            Looking for a bridge partner? Browse available players or post your availability to find your perfect match for your next game.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Players - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-[#C4914F]" />
              <h2 className="text-2xl font-serif font-bold">Available Players</h2>
              <span className="text-gray-500 text-sm">({players.length} {players.length === 1 ? 'player' : 'players'})</span>
            </div>

            {loading ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Loading listings...</p>
              </Card>
            ) : players.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No players currently seeking partners. Be the first to post!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {players.map((player, index) => (
                  <Card key={player.id} className="bg-gradient-card border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="p-5 relative">
                      {/* Level Badge - Top Right Corner */}
                      <div className={`absolute -top-0 -right-0 flex-shrink-0 rounded-none rounded-bl-lg rounded-tr-lg px-3 py-1.5 text-xs font-semibold ${getLevelColor(player.level)}`}>
                        {player.level}
                      </div>

                      <div>
                        {/* Name */}
                        <div className="flex items-center gap-2 mb-3 pr-20">
                          <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <h3 className="font-serif text-lg font-semibold text-foreground truncate">
                            {player.name}
                          </h3>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          {/* Date */}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>
                              {new Date(player.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          
                          {/* Time */}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>{formatTime(player.time)}</span>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{player.location}</span>
                          </div>

                          {/* Email */}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <a 
                              href={`mailto:${player.email}`}
                              className="text-accent hover:underline truncate"
                            >
                              {player.email}
                            </a>
                          </div>

                          {/* Notes - Always rendered with min-height for consistent spacing */}
                          <div className="flex items-start gap-2 text-muted-foreground pt-1 min-h-[40px]">
                            {player.notes && (
                              <>
                                <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span className="text-xs italic line-clamp-2">{player.notes}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <div className="pt-3 border-t border-border/50">
                          <button
                            onClick={() => handleRemove(player)}
                            className="w-full text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2"
                          >
                            <UserMinus className="w-4 h-4" />
                            Partner no longer needed
                          </button>
                        </div>
                      </div>
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
                <h2 className="text-xl font-serif font-bold">Post Your Availability</h2>
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
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value, locationOther: "" })}
                  >
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Branford">Branford</SelectItem>
                      <SelectItem value="Old Saybrook">Old Saybrook</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {formData.location === "Other" && (
                    <Input
                      placeholder="Please specify location"
                      value={formData.locationOther}
                      onChange={(e) => setFormData({ ...formData, locationOther: e.target.value })}
                      className="mt-2"
                      required
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-10",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                          {selectedDate ? format(selectedDate, "MM/dd/yyyy") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            setFormData({ 
                              ...formData, 
                              date: date ? format(date, "yyyy-MM-dd") : "" 
                            });
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="time">Time *</Label>
                    <Select
                      value={formData.time}
                      onValueChange={(value) => setFormData({ ...formData, time: value })}
                    >
                      <SelectTrigger id="time">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="09:15">9:15 AM</SelectItem>
                        <SelectItem value="09:30">9:30 AM</SelectItem>
                        <SelectItem value="09:45">9:45 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="10:15">10:15 AM</SelectItem>
                        <SelectItem value="10:30">10:30 AM</SelectItem>
                        <SelectItem value="10:45">10:45 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="11:15">11:15 AM</SelectItem>
                        <SelectItem value="11:30">11:30 AM</SelectItem>
                        <SelectItem value="11:45">11:45 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="12:15">12:15 PM</SelectItem>
                        <SelectItem value="12:30">12:30 PM</SelectItem>
                        <SelectItem value="12:45">12:45 PM</SelectItem>
                        <SelectItem value="13:00">1:00 PM</SelectItem>
                        <SelectItem value="13:15">1:15 PM</SelectItem>
                        <SelectItem value="13:30">1:30 PM</SelectItem>
                        <SelectItem value="13:45">1:45 PM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="14:15">2:15 PM</SelectItem>
                        <SelectItem value="14:30">2:30 PM</SelectItem>
                        <SelectItem value="14:45">2:45 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="15:15">3:15 PM</SelectItem>
                        <SelectItem value="15:30">3:30 PM</SelectItem>
                        <SelectItem value="15:45">3:45 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                        <SelectItem value="16:15">4:15 PM</SelectItem>
                        <SelectItem value="16:30">4:30 PM</SelectItem>
                        <SelectItem value="16:45">4:45 PM</SelectItem>
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                        <SelectItem value="17:15">5:15 PM</SelectItem>
                        <SelectItem value="17:30">5:30 PM</SelectItem>
                        <SelectItem value="17:45">5:45 PM</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                        <SelectItem value="18:15">6:15 PM</SelectItem>
                        <SelectItem value="18:30">6:30 PM</SelectItem>
                        <SelectItem value="18:45">6:45 PM</SelectItem>
                        <SelectItem value="19:00">7:00 PM</SelectItem>
                        <SelectItem value="19:15">7:15 PM</SelectItem>
                        <SelectItem value="19:30">7:30 PM</SelectItem>
                        <SelectItem value="19:45">7:45 PM</SelectItem>
                        <SelectItem value="20:00">8:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
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

                <div>
                  <Label htmlFor="event_link">Event Link (optional)</Label>
                  <Input
                    id="event_link"
                    type="url"
                    placeholder="https://bridgewebs.com/event/..."
                    value={formData.event_link}
                    onChange={(e) => setFormData({ ...formData, event_link: e.target.value })}
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
            {removeDialog.player && (
              <>
                Please confirm that {removeDialog.player.email} no longer needs a partner for their bridge game on{' '}
                {format(new Date(removeDialog.player.date), 'EEE, MMM d')} at {formatTime(removeDialog.player.time)}.
              </>
            )}
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

      {/* Footer */}
      <footer className="bg-[#F5F3F0] border-t border-gray-200 py-12 px-4 mt-auto">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-3">
            <span className="text-3xl text-gray-400">♠</span>
          </div>
          <h3 className="text-lg font-serif font-semibold text-gray-700 mb-2">Bridge Partner Finder</h3>
          <p className="text-sm text-gray-500">Find your perfect bridge partner for your next game</p>
        </div>
      </footer>
    </div>
  );
};

export default PartnerFinder;
