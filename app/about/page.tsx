import Header from '../components/Header';
import Footer from '../components/Footer';
import { Rocket, Target, Shield, Zap } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="page-layout min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Header />
      
      <main className="grow pt-24 pb-16 px-6 max-w-7xl mx-auto w-full">
        <section className="text-center mb-20 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to Daily Dock
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Your all-in-one productivity harbor. We provide the tools you need to stay organized, focused, and efficient in your daily life.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {[
            { icon: Rocket, title: "Stay Ahead", desc: "Track your goals and tasks with precision and speed." },
            { icon: Target, title: "Focused Mode", desc: "Our built-in Pomodoro timer keeps you in the flow state." },
            { icon: Shield, title: "Privacy First", desc: "Your data is yours. We prioritize security and privacy above all." },
            { icon: Zap, title: "Seamless Sync", desc: "Access your dashboard from any device, anytime, anywhere." }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/50 transition-all duration-300 group">
              <feature.icon className="w-12 h-12 mb-6 text-secondary group-hover:text-primary transition-colors" />
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl overflow-hidden relative p-12 border border-border bg-linear-to-br from-card to-background">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,var(--color-primary),transparent_50%)] opacity-10"></div>
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              We believe that productivity shouldn't feel like a chore. Daily Dock was born out of the need for a simple, beautiful, and unified workspace that integrates the essential tools for modern work and life. From daily journaling to complex task management, we're here to help you navigate your day with ease.
            </p>
            <div className="flex gap-4">
                <div className="px-6 py-3 rounded-full bg-secondary text-secondary-foreground font-semibold">Join the Fleet</div>
                <div className="px-6 py-3 rounded-full border border-border hover:bg-muted/50 transition-colors">Learn More</div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
