import React from 'react';
import { Info, User, ShieldCheck } from 'lucide-react';
import './About.css';

const About = () => {
    return (
        <div className="about-container animate-fade-in">
            <div className="about-header">
                <h1>About MediTrack</h1>
                <p className="subtitle">Learn more about the project and its creator.</p>
            </div>

            <div className="about-grid">
                <div className="about-card glass-panel profile-section text-center">
                    <div className="about-icon-wrapper main-icon">
                        <User size={32} />
                    </div>
                    <h2>The Creator</h2>
                    <p className="creator-name">Chitteti Pradeepthi</p>
                    <p className="creator-bio">
                        Dedicated to developing intuitive healthcare solutions that bridge the gap between technology and wellness.
                    </p>
                </div>

                <div className="about-card glass-panel project-section text-center">
                    <div className="about-icon-wrapper main-icon accent">
                        <ShieldCheck size={32} />
                    </div>
                    <h2>The Project</h2>
                    <div className="project-details">
                        <p>
                            <strong>MediTrack</strong> is a clinical-grade medicine management system designed for individual health tracking. 
                            It simplifies complex medication schedules through a professional dashboard, real-time tracking, 
                            and a comprehensive medical calendar.
                        </p>
                        <p>
                            Built with a focus on <strong>reliability</strong> and <strong>privacy</strong>, MediTrack ensures you 
                            never miss a dose and stay on top of your health journey.
                        </p>
                    </div>
                </div>
            </div>

            <div className="about-footer glass-panel">
                <div className="footer-content">
                    <Info size={16} />
                    <span>MediTrack Version 1.0.0 • Professional Health Management Interface</span>
                </div>
            </div>
        </div>
    );
};

export default About;
