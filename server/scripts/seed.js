require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { connectDB } = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const ContactMessage = require('../models/ContactMessage');
const Invite = require('../models/Invite');

const seedData = async () => {
  try {
    console.log('🌱 [Seeder] Connecting to database...');
    await connectDB();

    console.log('🧹 [Seeder] Clearing existing data...');
    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      Event.deleteMany(),
      RSVP.deleteMany(),
      Comment.deleteMany(),
      Notification.deleteMany(),
      ContactMessage.deleteMany(),
      Invite.deleteMany(),
    ]);

    console.log('👤 [Seeder] Creating users (Admin, Organizers, Attendees)...');
    const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

    // 1. Admin
    const admin = await User.create({
      name: 'Alexander Cross',
      email: 'admin@eventhub.io',
      passwordHash: defaultPasswordHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      bio: 'Platform Administrator & Community Director at EventHub.',
      isActive: true,
    });

    // 2. Organizers
    const organizer1 = await User.create({
      name: 'Sarah Chen',
      email: 'organizer1@eventhub.io',
      passwordHash: defaultPasswordHash,
      role: 'organizer',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      bio: 'Lead organizer for Silicon Valley Tech Summit & NextGen AI Developer Meetups.',
      isActive: true,
    });

    const organizer2 = await User.create({
      name: 'Marcus Vance',
      email: 'organizer2@eventhub.io',
      passwordHash: defaultPasswordHash,
      role: 'organizer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      bio: 'Festival director, audio engineer, and creator of the annual Sunset Sonic Series.',
      isActive: true,
    });

    const organizer3 = await User.create({
      name: 'Elena Rostova',
      email: 'organizer3@eventhub.io',
      passwordHash: defaultPasswordHash,
      role: 'organizer',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
      bio: 'Venture Partner & Host of Global Founders Roundtable.',
      isActive: true,
    });

    // 3. 15 Attendees
    const attendeeProfiles = [
      { name: 'Liam Davies', email: 'liam@example.com', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&fit=crop' },
      { name: 'Emma Watson', email: 'emma@example.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&fit=crop' },
      { name: 'Noah Miller', email: 'noah@example.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop' },
      { name: 'Olivia Garcia', email: 'olivia@example.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&fit=crop' },
      { name: 'William Zhang', email: 'william@example.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&fit=crop' },
      { name: 'Sophia Martinez', email: 'sophia@example.com', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&fit=crop' },
      { name: 'James Wilson', email: 'james@example.com', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&fit=crop' },
      { name: 'Isabella Taylor', email: 'isabella@example.com', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&fit=crop' },
      { name: 'Lucas Anderson', email: 'lucas@example.com', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&fit=crop' },
      { name: 'Mia Thomas', email: 'mia@example.com', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&fit=crop' },
      { name: 'Henry Jackson', email: 'henry@example.com', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&fit=crop' },
      { name: 'Ava White', email: 'ava@example.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop' },
      { name: 'Ethan Harris', email: 'ethan@example.com', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&fit=crop' },
      { name: 'Charlotte Martin', email: 'charlotte@example.com', avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=200&fit=crop' },
      { name: 'Mason Clark', email: 'mason@example.com', avatar: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=200&fit=crop' },
    ];

    const attendees = [];
    for (const p of attendeeProfiles) {
      const att = await User.create({
        name: p.name,
        email: p.email,
        passwordHash: defaultPasswordHash,
        role: 'attendee',
        avatar: p.avatar,
        bio: 'Tech enthusiast and passionate event explorer.',
      });
      attendees.push(att);
    }

    console.log('🏷️ [Seeder] Creating categories...');
    const categoryDefs = [
      { name: 'Technology & AI', slug: 'tech-ai', icon: 'Cpu', color: '#6366F1', description: 'Cutting-edge AI conferences, developer workshops, and tech expos.' },
      { name: 'Music & Concerts', slug: 'music-concerts', icon: 'Music', color: '#8B5CF6', description: 'Live concerts, acoustic sets, indie festivals, and DJ sets.' },
      { name: 'Business & Startups', slug: 'business-startups', icon: 'Briefcase', color: '#0EA5E9', description: 'Pitch nights, venture roundtables, and networking mixers.' },
      { name: 'Design & Creative', slug: 'design-creative', icon: 'Palette', color: '#EC4899', description: 'UI/UX design, generative art exhibitions, and typography sessions.' },
      { name: 'Health & Wellness', slug: 'health-wellness', icon: 'Heart', color: '#10B981', description: 'Mindfulness retreats, yoga classes, and health seminars.' },
      { name: 'Sports & Outdoor', slug: 'sports-outdoor', icon: 'Trophy', color: '#F59E0B', description: 'Marathons, soccer tournaments, trail hikes, and cycling.' },
      { name: 'Workshops & Education', slug: 'workshops-education', icon: 'GraduationCap', color: '#3B82F6', description: 'Hands-on bootcamps, masterclasses, and skill training.' },
      { name: 'Social & Networking', slug: 'social-networking', icon: 'Users', color: '#14B8A6', description: 'Community meetups, food tasting socials, and book clubs.' },
    ];

    const categories = [];
    for (const c of categoryDefs) {
      const cat = await Category.create(c);
      categories.push(cat);
    }

    console.log('📅 [Seeder] Creating 22 realistic events...');
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const eventList = [
      // 1. Featured Flagship AI Summit (Upcoming, in 5 days)
      {
        title: 'Global AI Summit 2026: Agentic Intelligence',
        slug: 'global-ai-summit-2026',
        description: 'Join industry pioneers, researchers, and builders for the premier annual conference on autonomous agentic systems, multimodal LLMs, and next-generation cognitive architecture.',
        category: categories[0]._id,
        tags: ['AI', 'MachineLearning', 'LLMs', 'Keynote', 'SiliconValley'],
        organizer: organizer1._id,
        coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 5 * day),
        endDate: new Date(now + 5 * day + 8 * 3600000),
        locationType: 'physical',
        venue: { name: 'Moscone Center', address: '747 Howard St', city: 'San Francisco, CA', mapUrl: 'https://maps.google.com' },
        capacity: 12, // small for easy waitlist testing!
        price: 249,
        visibility: 'public',
        status: 'published',
        isFeatured: true,
        rsvpDeadline: new Date(now + 4 * day),
        agenda: [
          { time: '09:00 AM', title: 'Keynote: The Dawn of Agentic Workflows', speaker: 'Dr. Demis Hassabis', description: 'Exploring the boundary between reasoning engines and real-world tools.' },
          { time: '11:30 AM', title: 'Panel: Multimodal Model Architectures', speaker: 'Sarah Chen & Guests', description: 'Next step in vision, voice and text fusion.' },
          { time: '02:00 PM', title: 'Hands-on Agentic Sandboxing', speaker: 'Open Source Maintainers', description: 'Building autonomous developer tools live.' },
        ],
      },
      // 2. Sunset Sonic Symphony (Upcoming, in 8 days)
      {
        title: 'Sunset Sonic Series: Indie & Ambient Electronic Live',
        slug: 'sunset-sonic-series',
        description: 'An open-air evening celebrating ambient electronic soundscapes, live modular synthesizers, and immersive spatial audio as the sun dips into the Pacific ocean.',
        category: categories[1]._id,
        tags: ['Music', 'Electronic', 'Concert', 'Outdoor', 'Festival'],
        organizer: organizer2._id,
        coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 8 * day + 17 * 3600000),
        endDate: new Date(now + 8 * day + 23 * 3600000),
        locationType: 'physical',
        venue: { name: 'Pier 27 Waterfront Lawn', address: 'Embarcadero', city: 'San Francisco, CA' },
        capacity: 250,
        price: 45,
        visibility: 'public',
        status: 'published',
        isFeatured: true,
        agenda: [
          { time: '05:30 PM', title: 'Doors Open & Acoustic Lounge', speaker: 'DJ Solar' },
          { time: '07:00 PM', title: 'Live Modular Synthesizer Set', speaker: 'Komorebi Sound Collective' },
          { time: '09:00 PM', title: 'Headliner: Tycho Live Spatial Experience', speaker: 'Tycho' },
        ],
      },
      // 3. Founders & Venture Roundtable (Upcoming, in 3 days)
      {
        title: 'Founders & Angel Pitch Night Q4',
        slug: 'founders-angel-pitch-night-q4',
        description: '10 seed-stage founders pitch to top-tier angels and syndicate leads. Followed by curated speed-networking and cocktail dinner.',
        category: categories[2]._id,
        tags: ['Startups', 'VentureCapital', 'Pitch', 'Networking'],
        organizer: organizer3._id,
        coverImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 3 * day + 18 * 3600000),
        endDate: new Date(now + 3 * day + 21 * 3600000),
        locationType: 'physical',
        venue: { name: 'Canopy Jackson Square', address: '595 Pacific Ave', city: 'San Francisco, CA' },
        capacity: 60,
        price: 0,
        visibility: 'public',
        status: 'published',
        isFeatured: true,
        agenda: [
          { time: '06:00 PM', title: 'Welcome Drinks & Name Tagging' },
          { time: '06:45 PM', title: '10 Pitches (3 mins pitch + 2 mins Q&A)' },
          { time: '08:00 PM', title: 'Investor Mix & Feedback Circle' },
        ],
      },
      // 4. UI/UX Micro-Interactions & Framer Motion Masterclass (Upcoming, in 10 days - Online)
      {
        title: 'Designing Delight: UI Micro-Interactions & Motion Workshop',
        slug: 'designing-delight-ui-motion',
        description: 'Master the art of 60fps animations, physics-based springs, gestures, and fluid interactive transitions using modern CSS and Framer Motion.',
        category: categories[3]._id,
        tags: ['Design', 'UI', 'UX', 'Frontend', 'Animation'],
        organizer: organizer1._id,
        coverImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 10 * day + 15 * 3600000),
        endDate: new Date(now + 10 * day + 18 * 3600000),
        locationType: 'online',
        onlineLink: 'https://zoom.us/j/9876543210',
        capacity: 100,
        price: 35,
        visibility: 'public',
        status: 'published',
        isFeatured: false,
        agenda: [
          { time: '03:00 PM', title: 'Principles of Perceived Performance' },
          { time: '04:00 PM', title: 'Building Reusable Animated Components' },
          { time: '05:15 PM', title: 'Live Critique and Q&A' },
        ],
      },
      // 5. Morning Yoga & Sound Healing (Tomorrow morning)
      {
        title: 'Sunrise Vinyasa Flow & Crystal Bowl Meditation',
        slug: 'sunrise-vinyasa-sound-healing',
        description: 'Rebalance your mind and body with an uplifting morning Vinyasa flow led by master instructors, followed by a 30-minute immersive Tibetan singing bowl sound bath.',
        category: categories[4]._id,
        tags: ['Yoga', 'Wellness', 'Meditation', 'Mindfulness'],
        organizer: organizer2._id,
        coverImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 1 * day + 7 * 3600000),
        endDate: new Date(now + 1 * day + 9 * 3600000),
        locationType: 'physical',
        venue: { name: 'Crissy Field East Beach', address: 'Mason St', city: 'San Francisco, CA' },
        capacity: 40,
        price: 20,
        visibility: 'public',
        status: 'published',
        isFeatured: false,
      },
      // 6. City Half-Marathon & 10K Run (Upcoming, in 14 days)
      {
        title: 'Golden Gate City Run: 10K & Half-Marathon Challenge',
        slug: 'golden-gate-city-run',
        description: 'Scenic course crossing the historic suspension bridge with chip timing, finisher medals, hydration stations, and post-race brunch festival.',
        category: categories[5]._id,
        tags: ['Running', 'Marathon', 'Fitness', 'Community'],
        organizer: organizer2._id,
        coverImage: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 14 * day + 7 * 3600000),
        endDate: new Date(now + 14 * day + 13 * 3600000),
        locationType: 'physical',
        venue: { name: 'Golden Gate Bridge Plaza', address: 'Hwy 101', city: 'San Francisco, CA' },
        capacity: 500,
        price: 55,
        visibility: 'public',
        status: 'published',
        isFeatured: true,
      },
      // 7. Full-Stack React & Node Bootcamp Masterclass (Upcoming, in 7 days)
      {
        title: 'Building Production Microservices with Node.js & Docker',
        slug: 'node-microservices-docker-masterclass',
        description: 'Deep dive into event-driven architecture, zero-downtime deployments, Redis caching layers, and resilient Node.js services at scale.',
        category: categories[6]._id,
        tags: ['NodeJS', 'Docker', 'Microservices', 'Backend', 'DevOps'],
        organizer: organizer1._id,
        coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 7 * day + 10 * 3600000),
        endDate: new Date(now + 7 * day + 17 * 3600000),
        locationType: 'online',
        onlineLink: 'https://meet.google.com/abc-defg-hij',
        capacity: 75,
        price: 0,
        visibility: 'public',
        status: 'published',
        isFeatured: false,
      },
      // 8. Rooftop Wine & Product Managers Mixer (Upcoming, in 4 days)
      {
        title: 'Rooftop Tech & Product Leaders Mixer',
        slug: 'rooftop-tech-product-leaders-mixer',
        description: 'Casual sunset networking for PMs, engineering leads, founders, and designers. Complimentary appetizers and craft beers.',
        category: categories[7]._id,
        tags: ['Networking', 'ProductManagement', 'Social', 'Mixer'],
        organizer: organizer3._id,
        coverImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 4 * day + 18 * 3600000),
        endDate: new Date(now + 4 * day + 21 * 3600000),
        locationType: 'physical',
        venue: { name: 'El Techo Rooftop', address: '2516 Mission St', city: 'San Francisco, CA' },
        capacity: 80,
        price: 15,
        visibility: 'public',
        status: 'published',
        isFeatured: false,
      },
      // 9. Full Event at Capacity (to immediately demonstrate Waitlist functionality!)
      {
        title: 'VIP Exclusive: Closed-Door AI Ethics & Policy Briefing',
        slug: 'vip-ai-ethics-briefing',
        description: 'Intimate Chatham House rule roundtable discussing high-stakes AI safety, regulatory compliance, and open-source models with federal advisors.',
        category: categories[0]._id,
        tags: ['AI', 'Policy', 'Executive', 'ChathamHouse'],
        organizer: organizer1._id,
        coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 6 * day + 14 * 3600000),
        endDate: new Date(now + 6 * day + 17 * 3600000),
        locationType: 'physical',
        venue: { name: 'The Battery Penthouse', address: '717 Battery St', city: 'San Francisco, CA' },
        capacity: 4, // small capacity that is already filled by seed RSVPs
        price: 0,
        visibility: 'public',
        status: 'published',
        isFeatured: false,
      },
      // 10. Past Event (for past events tab and historical analytics)
      {
        title: 'Web3 & Decentralized Protocols Hackathon 2025',
        slug: 'web3-hackathon-2025',
        description: '36-hour weekend sprint hacking on zero-knowledge proofs, decentralized storage, and cryptographic identity.',
        category: categories[0]._id,
        tags: ['Hackathon', 'Web3', 'Crypto', 'Past'],
        organizer: organizer1._id,
        coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now - 20 * day),
        endDate: new Date(now - 18 * day),
        locationType: 'physical',
        venue: { name: 'Werqwise Innovation Hub', address: '149 New Montgomery St', city: 'San Francisco, CA' },
        capacity: 150,
        price: 0,
        visibility: 'public',
        status: 'published',
        isFeatured: false,
      },
      // 11. Past Event 2
      {
        title: 'Acoustic Unplugged: Autumn Fireside Sessions',
        slug: 'acoustic-unplugged-autumn',
        description: 'Intimate candlelit acoustic performances featuring local songwriters and folk duos.',
        category: categories[1]._id,
        tags: ['Acoustic', 'LiveMusic', 'Past'],
        organizer: organizer2._id,
        coverImage: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now - 12 * day),
        endDate: new Date(now - 12 * day + 4 * 3600000),
        locationType: 'physical',
        venue: { name: 'Swedish American Hall', address: '2174 Market St', city: 'San Francisco, CA' },
        capacity: 80,
        price: 25,
        visibility: 'public',
        status: 'published',
      },
      // 12. Draft Event (organizer can view and publish)
      {
        title: 'Future of Sustainable Mobility Conference 2026',
        slug: 'future-sustainable-mobility-2026',
        description: 'Exploring solid-state battery tech, urban eVTOL networks, and grid resilience.',
        category: categories[0]._id,
        tags: ['CleanTech', 'Mobility', 'Draft'],
        organizer: organizer1._id,
        coverImage: 'https://images.unsplash.com/photo-1558441719-8b489c63f707?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 45 * day),
        endDate: new Date(now + 46 * day),
        locationType: 'physical',
        venue: { name: 'Santa Clara Convention Center', address: '5001 Great America Pkwy', city: 'Santa Clara, CA' },
        capacity: 300,
        price: 180,
        visibility: 'public',
        status: 'draft',
      },
      // 13. Cancelled Event
      {
        title: 'VR Metaverse Gaming Carnival (Cancelled)',
        slug: 'vr-metaverse-carnival-cancelled',
        description: 'Showcasing the latest spatial computing headsets and multiplayer VR tournament.',
        category: categories[0]._id,
        tags: ['VR', 'Gaming', 'Cancelled'],
        organizer: organizer3._id,
        coverImage: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 12 * day),
        endDate: new Date(now + 13 * day),
        locationType: 'physical',
        venue: { name: 'Metreon SF', address: '135 4th St', city: 'San Francisco, CA' },
        capacity: 100,
        price: 30,
        visibility: 'public',
        status: 'cancelled',
      },
      // 14 - 22: Additional rich events across categories
      {
        title: 'Coffee Tasting & Specialty Roast Masterclass',
        slug: 'coffee-tasting-specialty-roast',
        description: 'Cupping sessions comparing single-origin beans from Ethiopia, Colombia, and Yemen with award-winning baristas.',
        category: categories[7]._id,
        tags: ['Coffee', 'Workshop', 'FoodAndDrink'],
        organizer: organizer3._id,
        coverImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 9 * day + 11 * 3600000),
        endDate: new Date(now + 9 * day + 13 * 3600000),
        locationType: 'physical',
        venue: { name: 'Sightglass Coffee Roastery', address: '270 7th St', city: 'San Francisco, CA' },
        capacity: 25,
        price: 40,
        visibility: 'public',
        status: 'published',
      },
      {
        title: 'Cybersecurity Defense & Red-Teaming Workshop',
        slug: 'cybersecurity-defense-red-team',
        description: 'Hands-on adversary emulation, cloud misconfigurations, and container breakout detection.',
        category: categories[0]._id,
        tags: ['Cybersecurity', 'Infosec', 'Hacking'],
        organizer: organizer1._id,
        coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 11 * day + 13 * 3600000),
        endDate: new Date(now + 11 * day + 17 * 3600000),
        locationType: 'online',
        onlineLink: 'https://zoom.us/j/1234567890',
        capacity: 150,
        price: 0,
        visibility: 'public',
        status: 'published',
      },
      {
        title: 'Contemporary Oil Painting & Mixed Media Exhibition',
        slug: 'contemporary-oil-painting-exhibition',
        description: 'Opening reception featuring 25 emerging Pacific Northwest visual artists exploring light and texture.',
        category: categories[3]._id,
        tags: ['Art', 'Exhibition', 'Culture'],
        organizer: organizer2._id,
        coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 13 * day + 18 * 3600000),
        endDate: new Date(now + 13 * day + 21 * 3600000),
        locationType: 'physical',
        venue: { name: 'Minnesota Street Project', address: '1275 Minnesota St', city: 'San Francisco, CA' },
        capacity: 180,
        price: 0,
        visibility: 'public',
        status: 'published',
      },
      {
        title: 'Trail Run & Coastal Redwoods Hike',
        slug: 'trail-run-coastal-redwoods',
        description: 'Guided 8-mile scenic loop through Muir Woods and Mt Tamalpais ridges. Suitable for intermediate hikers.',
        category: categories[5]._id,
        tags: ['Hiking', 'Outdoors', 'Nature'],
        organizer: organizer2._id,
        coverImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 15 * day + 8 * 3600000),
        endDate: new Date(now + 15 * day + 13 * 3600000),
        locationType: 'physical',
        venue: { name: 'Pantoll Ranger Station', address: 'Panoramic Hwy', city: 'Mill Valley, CA' },
        capacity: 35,
        price: 15,
        visibility: 'public',
        status: 'published',
      },
      {
        title: 'B2B SaaS Growth & GTM Playbook',
        slug: 'b2b-saas-growth-playbook',
        description: 'Proven strategies for scaling from $1M to $10M ARR: pricing levers, outbound automation, and product-led growth.',
        category: categories[2]._id,
        tags: ['SaaS', 'Marketing', 'Growth'],
        organizer: organizer3._id,
        coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 16 * day + 16 * 3600000),
        endDate: new Date(now + 16 * day + 18 * 3600000),
        locationType: 'online',
        onlineLink: 'https://meet.google.com/saas-growth-summit',
        capacity: 200,
        price: 0,
        visibility: 'public',
        status: 'published',
      },
      {
        title: 'Breathwork & Ice Bath Recovery Workshop',
        slug: 'breathwork-ice-bath-recovery',
        description: 'Wim Hof method breathing techniques followed by guided 3-minute cold immersion plunges to boost resilience.',
        category: categories[4]._id,
        tags: ['Wellness', 'ColdPlunge', 'Health'],
        organizer: organizer2._id,
        coverImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 18 * day + 10 * 3600000),
        endDate: new Date(now + 18 * day + 12 * 3600000),
        locationType: 'physical',
        venue: { name: 'Remedy Place SF', address: 'Marina Blvd', city: 'San Francisco, CA' },
        capacity: 20,
        price: 45,
        visibility: 'public',
        status: 'published',
      },
      {
        title: 'Intro to Pottery & Wheel Throwing',
        slug: 'intro-pottery-wheel-throwing',
        description: 'Beginner-friendly ceramics workshop where you will shape, trim, and glaze your own stoneware mug or bowl.',
        category: categories[6]._id,
        tags: ['Pottery', 'Crafts', 'HandsOn'],
        organizer: organizer3._id,
        coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 21 * day + 14 * 3600000),
        endDate: new Date(now + 21 * day + 17 * 3600000),
        locationType: 'physical',
        venue: { name: 'Clay By The Bay Studio', address: '1616 Powell St', city: 'San Francisco, CA' },
        capacity: 15,
        price: 65,
        visibility: 'public',
        status: 'published',
      },
      {
        title: 'Jazz in the Alley: Speakeasy Night',
        slug: 'jazz-in-the-alley-speakeasy',
        description: 'Live bebop quartet, vintage craft cocktails, and noir atmosphere tucked inside a historic alley cellar.',
        category: categories[1]._id,
        tags: ['Jazz', 'Nightlife', 'Cocktails'],
        organizer: organizer2._id,
        coverImage: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 22 * day + 20 * 3600000),
        endDate: new Date(now + 23 * day + 1 * 3600000),
        locationType: 'physical',
        venue: { name: 'Black Cat Jazz Supper Club', address: '400 Eddy St', city: 'San Francisco, CA' },
        capacity: 65,
        price: 30,
        visibility: 'public',
        status: 'published',
      },
      {
        title: 'Urban Gardening & Microgreens at Home',
        slug: 'urban-gardening-microgreens',
        description: 'Learn hydroponic setup, soil prep, and balcony gardening to grow fresh herbs and microgreens year-round.',
        category: categories[6]._id,
        tags: ['Gardening', 'Sustainability', 'Green'],
        organizer: organizer3._id,
        coverImage: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1200&auto=format&fit=crop&q=80',
        startDate: new Date(now + 25 * day + 11 * 3600000),
        endDate: new Date(now + 25 * day + 13 * 3600000),
        locationType: 'physical',
        venue: { name: 'Flora Grubb Gardens', address: '1634 Jerrold Ave', city: 'San Francisco, CA' },
        capacity: 30,
        price: 25,
        visibility: 'public',
        status: 'published',
      },
    ];

    const createdEvents = [];
    for (const evData of eventList) {
      const ev = await Event.create(evData);
      createdEvents.push(ev);
    }

    console.log('🎟️ [Seeder] Generating realistic RSVPs across events...');
    // Seed RSVPs for the flagship AI summit
    for (let i = 0; i < 10; i++) {
      const attendee = attendees[i];
      await RSVP.create({
        event: createdEvents[0]._id,
        user: attendee._id,
        guestName: attendee.name,
        guestEmail: attendee.email,
        status: 'going',
        guestsCount: 1,
        ticketCode: `EVT-AI26-${attendee.name.substring(0, 3).toUpperCase()}${i + 10}`,
        checkedIn: i < 3, // 3 already checked in for live demo
        checkedInAt: i < 3 ? new Date(now - i * 3600000) : null,
      });
    }

    // Seed the full VIP event (#9) with capacity 4, and 2 people on waitlist!
    for (let i = 0; i < 4; i++) {
      const att = attendees[i];
      await RSVP.create({
        event: createdEvents[8]._id,
        user: att._id,
        guestName: att.name,
        guestEmail: att.email,
        status: 'going',
        guestsCount: 1,
        ticketCode: `EVT-VIP-${i + 100}`,
      });
    }
    // 2 on waitlist for event #9
    for (let i = 4; i < 6; i++) {
      const att = attendees[i];
      await RSVP.create({
        event: createdEvents[8]._id,
        user: att._id,
        guestName: att.name,
        guestEmail: att.email,
        status: 'waitlisted',
        guestsCount: 1,
        note: 'High interest in AI policy!',
      });
    }

    // Seed more RSVPs across other upcoming events
    for (let i = 1; i < 8; i++) {
      const ev = createdEvents[i];
      for (let j = 0; j < 5; j++) {
        const att = attendees[(i + j) % attendees.length];
        await RSVP.create({
          event: ev._id,
          user: att._id,
          guestName: att.name,
          guestEmail: att.email,
          status: j === 4 ? 'maybe' : 'going',
          guestsCount: 1,
          ticketCode: `EVT-${ev.title.substring(0, 3).toUpperCase()}-${att.name.substring(0, 3).toUpperCase()}${j + 10}`,
          checkedIn: false,
        });
      }
    }

    console.log('💬 [Seeder] Adding comments for event discussions...');
    await Comment.create({
      event: createdEvents[0]._id,
      user: attendees[0]._id,
      content: 'Will there be session recordings available for registered attendees who have schedule conflicts?',
    });
    await Comment.create({
      event: createdEvents[0]._id,
      user: organizer1._id,
      content: 'Hi Liam! Yes, all main stage keynotes and panel sessions will be recorded in 4K and uploaded to attendee dashboards within 48 hours.',
    });
    await Comment.create({
      event: createdEvents[1]._id,
      user: attendees[2]._id,
      content: 'Super excited for the sunset set! Is outside food/beverage allowed on Pier 27?',
    });
    await Comment.create({
      event: createdEvents[1]._id,
      user: organizer2._id,
      content: 'We have 8 gourmet food trucks and a craft beer garden inside the gates, so outside coolers are not permitted.',
    });

    console.log('🔔 [Seeder] Creating sample notifications...');
    await Notification.create({
      user: attendees[0]._id,
      title: 'RSVP Confirmed 🎉',
      message: 'You are confirmed for Global AI Summit 2026. View your ticket with QR code anytime.',
      type: 'rsvp',
      link: `/events/${createdEvents[0]._id}`,
      read: false,
    });
    await Notification.create({
      user: attendees[4]._id,
      title: 'Waitlist Registered ⏳',
      message: 'You are #1 on the waitlist for VIP Exclusive: Closed-Door AI Ethics & Policy Briefing.',
      type: 'rsvp',
      link: `/events/${createdEvents[8]._id}`,
      read: false,
    });

    console.log('📩 [Seeder] Creating sample contact inquiries...');
    await ContactMessage.create({
      name: 'Jessica Reynolds',
      email: 'jessica.reynolds@acme.org',
      subject: 'Corporate Sponsorship Inquiry for Global AI Summit',
      message: 'Hello EventHub team, our company is interested in gold-tier sponsorship for the upcoming AI Summit. Please send prospectus details.',
      status: 'unread',
    });

    console.log('====================================================');
    console.log('✨ [Seeder] Seed process successfully completed!');
    console.log('====================================================');
    console.log('DEMO CREDENTIALS:');
    console.log('----------------------------------------------------');
    console.log('👑 Admin:     admin@eventhub.io      / Password123!');
    console.log('💼 Organizer: organizer1@eventhub.io / Password123!');
    console.log('💼 Organizer: organizer2@eventhub.io / Password123!');
    console.log('💼 Organizer: organizer3@eventhub.io / Password123!');
    console.log('🎟️ Attendee:  liam@example.com       / Password123!');
    console.log('🎟️ Attendee:  emma@example.com       / Password123!');
    console.log('====================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ [Seeder] Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
