import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Star, Award, Zap } from "lucide-react";

export default function MentorshipSection() {
  const mentors = [
    {
      name: "Dr. Fatima Ahmed",
      expertise: "Data Science & ML",
      experience: "8+ years",
      rating: 4.9,
      reviews: 127,
    },
    {
      name: "Karim Hassan",
      expertise: "Web Development",
      experience: "6+ years",
      rating: 4.8,
      reviews: 95,
    },
    {
      name: "Priya Sharma",
      expertise: "Career Guidance",
      experience: "10+ years",
      rating: 5.0,
      reviews: 156,
    },
    {
      name: "Alex Johnson",
      expertise: "Software Engineering",
      experience: "7+ years",
      rating: 4.7,
      reviews: 82,
    },
  ];

  return (
    <Card className="p-6 gradient-border">
      <h3 className="text-2xl font-bold mb-6">Mentorship Program</h3>

      <div className="space-y-6">
        {/* Program Benefits */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Zap className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-bold mb-2">Personalized Guidance</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get tailored advice based on your goals and challenges
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Users className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-bold mb-2">Network Building</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connect with experienced professionals in your field
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Award className="w-6 h-6 text-purple-600 mb-2" />
            <h4 className="font-bold mb-2">Career Development</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Plan your career path with expert insights
            </p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <Star className="w-6 h-6 text-orange-600 mb-2" />
            <h4 className="font-bold mb-2">Skill Enhancement</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Develop skills that matter in your industry
            </p>
          </div>
        </div>

        {/* Available Mentors */}
        <div>
          <h4 className="font-bold text-lg mb-4">Meet Our Mentors</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {mentors.map((mentor, idx) => (
              <div
                key={idx}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-bold text-blue-600 dark:text-blue-400">{mentor.name}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{mentor.expertise}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-sm">{mentor.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500">{mentor.reviews} reviews</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{mentor.experience}</p>
                <Button variant="outline" className="w-full text-xs">
                  Request Mentorship
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-bold text-lg mb-3">How It Works</h4>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-sm">Browse Mentors</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Find mentors matching your interests</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-sm">Send Request</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Submit a mentorship request with your goals</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-sm">Get Matched</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Mentor reviews and accepts your request</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                4
              </div>
              <div>
                <p className="font-semibold text-sm">Start Learning</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Schedule sessions and begin your journey</p>
              </div>
            </div>
          </div>
        </div>

        {/* Topics to Discuss */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
          <h4 className="font-bold mb-3">Common Mentorship Topics</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Career Planning",
              "Interview Prep",
              "Technical Skills",
              "Leadership",
              "Work-Life Balance",
              "Networking",
              "Project Guidance",
              "Industry Insights",
            ].map((topic, idx) => (
              <div key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                {topic}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6">
          Find Your Mentor Today
        </Button>
      </div>
    </Card>
  );
}
