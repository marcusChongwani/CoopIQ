import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";

const MissionSection = () => {
  return (
    <section className="py-12 animate-slide-up">
      <Link 
        to="/about" 
        className="flex flex-col items-center text-center gap-5 p-6 rounded-2xl  transition-colors group"
      >
        <div className="flex-shrink-0">
          <img 
            src={logo} 
            alt="Depths of Zambia" 
            className="w-20 h-20 rounded-full object-contain bg-primary"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold mb-1">Our Mission</h3>
          <p className="text-muted-foreground mb-3">
            Help you understand what really matters about Zambia
          </p>
          <span className="inline-flex items-center gap-2 underline text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            ABOUT
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </Link>
    </section>
  );
};

export default MissionSection;
