import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";

const MissionSection = () => {
  return (
    <section className="py-12 animate-slide-up">
      <Link 
        to="/about" 
        className="flex items-start gap-5 p-6 rounded-2xl bg-card hover:bg-muted/50 transition-colors group"
      >
        <div className="flex-shrink-0">
          <img 
            src={logo} 
            alt="Depths of Zambia" 
            className="w-14 h-14 rounded-full object-contain bg-primary"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold mb-1">Our Mission</h3>
          <p className="text-muted-foreground mb-3">
            Help you understand what really matters about Zambia
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            ABOUT
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </Link>
    </section>
  );
};

export default MissionSection;
