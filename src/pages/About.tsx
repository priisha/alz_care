import React, { useEffect, useRef, useState } from 'react';
import { Activity, Shield, MapPin, Bell, Heart, Cpu, Zap, Users } from 'lucide-react';

const useCounter = (target: number, duration: number = 1500, start: boolean = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
};

const StatCard: React.FC<{ value: number; suffix: string; label: string; started: boolean }> = ({ value, suffix, label, started }) => {
  const count = useCounter(value, 1400, started);
  return (
    <div className="text-center">
      <p className="text-4xl font-extrabold text-blue-700 tracking-tight">
        {count}{suffix}
      </p>
      <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
    </div>
  );
};

const About: React.FC = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.4 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: 'Fall Detection',
      desc: 'Advanced motion sensors instantly detect falls and alert caregivers within seconds.',
    },
    {
      icon: <MapPin className="h-6 w-6 text-blue-600" />,
      title: 'GPS Tracking',
      desc: 'Real-time location monitoring with geofencing keeps patients safe within defined boundaries.',
    },
    {
      icon: <Bell className="h-6 w-6 text-blue-600" />,
      title: 'Smart Alerts',
      desc: 'Intelligent notifications prioritize urgent events so caregivers respond when it matters most.',
    },
    {
      icon: <Cpu className="h-6 w-6 text-blue-600" />,
      title: 'Wearable Integration',
      desc: 'Seamless hardware-software integration through purpose-built wearable sensors.',
    },
    {
      icon: <Zap className="h-6 w-6 text-blue-600" />,
      title: 'Real-Time Sync',
      desc: 'Live data streams ensure caregiver dashboards always reflect the latest patient status.',
    },
    {
      icon: <Heart className="h-6 w-6 text-blue-600" />,
      title: 'Dignity First',
      desc: "Designed to preserve the patient's independence while maximizing safety and wellbeing.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      <section className="bg-blue-900 text-white">
        <div className="absolute -top-16 -right-16 h-72 w-72" />
        <div className="absolute bottom-0 left-0 h-48 w-48 " />

        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium tracking-wide">
            <Activity className="h-4 w-4" />
            Health Technology Initiative
          </div>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight mb-6">
            About <span className="text-blue-300">AlzCare</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Smart Care for Peace of Mind — empowering families and caregivers with intelligent tools to protect the ones they love.
          </p>
        </div>
      </section>

      <section ref={statsRef} className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard value={24} suffix="/7" label="Monitoring" started={statsVisible} />
          <StatCard value={99} suffix="%" label="Uptime" started={statsVisible} />
          <StatCard value={5} suffix="s" label="Alert Response" started={statsVisible} />
          <StatCard value={100} suffix="+" label="Families Supported" started={statsVisible} />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Our Mission</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-5 leading-snug">
              Improving safety & quality of life for those with Alzheimer's
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              AlzCare is an innovative health technology initiative designed to improve the safety and quality of life for people living with Alzheimer's disease and other forms of dementia. Our goal is to provide a reliable and intelligent monitoring solution that helps caregivers and families ensure the wellbeing of their loved ones while maintaining the patient's independence and dignity.
            </p>
            <p className="text-gray-600 leading-relaxed">
              AlzCare focuses on developing a smart wearable system that can detect falls, monitor unusual movements, and track location in real time. The system integrates advanced sensors, GPS technology, and communication modules to identify potential emergencies and instantly notify caregivers.
            </p>
          </div>

          <div className="relative">
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">AlzCare System</p>
                  <p className="text-xs text-gray-400">Hardware + Software Integration</p>
                </div>
                <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse inline-block" />
                  Live
                </span>
              </div>
              {[
                { label: 'Fall Detection', val: 'Active', color: 'text-emerald-600' },
                { label: 'GPS Module', val: 'Tracking', color: 'text-blue-600' },
                { label: 'Caregiver Alerts', val: 'Enabled', color: 'text-emerald-600' },
                { label: 'Motion Sensing', val: 'Monitoring', color: 'text-blue-600' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-blue-100 last:border-0">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={`text-xs font-bold ${item.color}`}>{item.val}</span>
                </div>
              ))}
            </div>

            <div className="absolute -bottom-4 -right-4 bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
              Smart Wearable System
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">What We Do</span>
            <h2 className="text-3xl font-extrabold text-gray-900">Core Capabilities</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 bg-white hover:bg-blue-50/30">
                <div className="h-11 w-11 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mb-4 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Our Values</span>
          <h2 className="text-3xl font-extrabold text-gray-900">Built on Care & Innovation</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <Users className="h-5 w-5 text-blue-600" />, title: 'Family-Centered', desc: 'Every decision is guided by real caregiver and patient needs.' },
            { icon: <Shield className="h-5 w-5 text-blue-600" />, title: 'Privacy & Trust', desc: 'Patient data is handled with the highest security and ethical standards.' },
            { icon: <Heart className="h-5 w-5 text-blue-600" />, title: 'Compassionate Tech', desc: 'Technology that serves human dignity, not the other way around.' },
          ].map(v => (
            <div key={v.title} className="flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-b from-blue-50 to-white border border-blue-100">
              <div className="h-12 w-12 rounded-full bg-white shadow-sm border border-blue-100 flex items-center justify-center mb-4">
                {v.icon}
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{v.title}</h3>
              <p className="text-sm text-gray-500">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-14 text-center">
          <Activity className="h-10 w-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-extrabold mb-3">Providing Peace of Mind, One Alert at a Time</h2>
          <p className="text-blue-200 text-sm max-w-lg mx-auto">
            Combining hardware and software technologies to create a supportive digital environment that enhances patient safety and reduces caregiver stress.
          </p>
        </div>
      </section>

    </div>
  );
};

export default About;