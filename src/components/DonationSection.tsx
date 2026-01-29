import { Link } from "react-router-dom";

const donationAmounts = [
  { amount: "K10", value: 10 },
  { amount: "K20", value: 20 },
  { amount: "K50", value: 50 },
  { amount: "K100", value: 100 },
  { amount: "K500", value: 500 },
  { amount: "Custom", value: null },
];

const DonationSection = () => {
  return (
    <section className="py-12 animate-slide-up">
      <div className="bg-primary rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl md:text-3xl text-white font-bold mb-6">We rely on our audience</h2>
        
        <div className="space-y-4 text-white mb-8">
          <p>
            Depths of Zambia is an independent media project focused on explaining Zambia's stories 
            clearly and honestly. Our videos and books are built through research, time, and consistency.
          </p>
          <p>
            We keep our videos free so anyone can watch, learn, and share. Support from viewers helps 
            cover the cost of producing new videos, maintaining the platform, and building better resources.
          </p>
          <p>
            If our work has helped you understand Zambia better, your support makes a real difference.
          </p>
          <p className="font-medium text-white">Every contribution helps.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {donationAmounts.map((item) => (
            <Link
              key={item.amount}
              to="/donate"
              className="bg-white hover:bg-gray-100 transition-colors rounded-full py-3 text-center font-bold text-lg text-foreground"
            >
              {item.amount}
            </Link>
          ))}
        </div>

        <p className="text-sm text-white text-center">
          Donations are optional and support independent media.
        </p>
      </div>
    </section>
  );
};

export default DonationSection;
