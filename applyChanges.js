const fs = require('fs');
const path = require('path');
const os = require('os');

// File mappings: { targetPath: content }
const FILES_TO_CREATE = {
  'frontend/src/layouts/MainLayout.jsx': `import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  const loc = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-gray-800 to-gray-900 border-r border-purple-500/30 overflow-y-auto"
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </motion.div>

      {/* Main Content */}
      <div className={\`flex-1 flex flex-col transition-all duration-300 \${sidebarOpen ? 'ml-64' : 'ml-0'}\`}>
        {/* Top Bar */}
        <motion.div
          className="sticky top-0 z-30 bg-gray-800 border-b border-purple-500/30 px-6 py-4 flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            {sidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            GaiaQuest
          </h1>
          <div className="w-6" />
        </motion.div>

        {/* Page Content */}
        <motion.main
          className="flex-1 overflow-y-auto p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={loc.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </motion.main>
      </div>
    </div>
  );
}`,

  'frontend/src/pages/Leaderboard.jsx': `import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { HiAdjustmentsHorizontal } from 'react-icons/hi2';

function LeaderRow({ rank, user }) {
  const medal = {
    1: { bg: 'bg-gradient-to-br from-yellow-300 to-yellow-500', icon: '🥇' },
    2: { bg: 'bg-gradient-to-br from-gray-300 to-gray-500', icon: '🥈' },
    3: { bg: 'bg-gradient-to-br from-orange-600 to-amber-700', icon: '🥉' },
  };

  const hasMedal = !!medal[rank];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gray-800/50 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
    >
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className={\`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 \${hasMedal ? medal[rank].bg : 'bg-gray-700'}\`}>
          {hasMedal ? medal[rank].icon : rank}
        </div>
        <div>
          <div className="font-semibold text-white">{user.name}</div>
          <div className="text-xs text-gray-400">Level {Math.floor((user.xp || 0) / 100) + 1}</div>
        </div>
      </div>

      <div className="flex-1 mx-6">
        <div className="text-xs text-gray-300 mb-2">{user.xp ?? 0} XP</div>
        <div className="w-full bg-gray-700/50 h-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: \`\${Math.min(100, (user.xp || 0) % 100)}%\` }}
            transition={{ duration: 0.6, delay: 0.1 }}
          />
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="text-xs text-gray-400">This Week</div>
        <div className="text-sm font-bold text-purple-400">{user.weeklyXp ?? 0} XP</div>
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [tab, setTab] = useState('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get('/api/leaderboard')
      .then((res) => {
        setData(Array.isArray(res.data) ? res.data : res.data.leaderboard || []);
      })
      .catch(() => {
        setData([
          { id: 'u1', name: 'Asha', xp: 450, weeklyXp: 120 },
          { id: 'u2', name: 'Ravi', xp: 380, weeklyXp: 95 },
          { id: 'u3', name: 'You', xp: 320, weeklyXp: 80 },
          { id: 'u4', name: 'Maya', xp: 240, weeklyXp: 55 },
          { id: 'u5', name: 'Ishaan', xp: 180, weeklyXp: 35 },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const sortedAll = [...data].sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const sortedWeekly = [...data].sort((a, b) => (b.weeklyXp || 0) - (a.weeklyXp || 0));
  const list = tab === 'weekly' ? sortedWeekly : sortedAll;

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <HiAdjustmentsHorizontal className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
            <p className="text-sm text-gray-400">See who's protecting the planet</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-xl border border-gray-700">
          {['weekly', 'all'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={\`px-4 py-2 rounded-lg font-medium transition-all \${
                tab === t
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }\`}
            >
              {t === 'weekly' ? 'This Week' : 'All Time'}
            </button>
          ))}
        </div>
      </header>

      <section className="space-y-3">
        {loading ? (
          <div className="p-8 bg-gray-800/50 rounded-xl border border-gray-700 text-gray-400 text-center">
            Loading leaderboard…
          </div>
        ) : list.length > 0 ? (
          list.map((u, idx) => <LeaderRow key={u.id || idx} rank={idx + 1} user={u} />)
        ) : (
          <div className="p-8 bg-gray-800/50 rounded-xl border border-gray-700 text-gray-400 text-center">
            No leaderboard data available
          </div>
        )}
      </section>
    </div>
  );
}`,

  'frontend/src/pages/Shop.jsx': `import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { HiShoppingCart, HiStar } from 'react-icons/hi2';

const ITEMS = [
  { id: 'boost1', title: 'Photo Boost', desc: 'Boost your photo acceptance chance by 30%', price: 50, emoji: '📸' },
  { id: 'hint', title: 'Hint Token', desc: 'Reveal an AI hint in any lesson', price: 25, emoji: '💡' },
  { id: 'avatar', title: 'Avatar Frame', desc: 'Premium frame for your profile picture', price: 120, emoji: '👑' },
  { id: 'xp_boost', title: 'XP Doubler', desc: 'Double XP earned for 24 hours', price: 75, emoji: '⚡' },
];

export default function Shop() {
  const [balance, setBalance] = useState(200);
  const [owned, setOwned] = useState([]);
  const [purchasing, setPurchasing] = useState(null);

  async function buy(item) {
    if (balance < item.price) {
      alert('Not enough XP!');
      return;
    }

    setPurchasing(item.id);
    try {
      const userId = localStorage.getItem('userId') || 'u1';
      const res = await axios.post('/api/shop/purchase', {
        userId,
        itemId: item.id,
      });
      if (res.data?.ok) {
        setBalance(res.data.user?.xp || balance - item.price);
        setOwned([...owned, item.id]);
      } else {
        alert(res.data?.error || 'Purchase failed');
      }
    } catch (e) {
      alert(e.response?.data?.error || e.message || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <HiShoppingCart className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Shop</h1>
            <p className="text-sm text-gray-400">Spend your hard-earned XP</p>
          </div>
        </div>

        <motion.div
          className="bg-gray-800 p-4 rounded-xl border border-purple-500/30 flex items-center gap-3"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <HiStar className="text-purple-400" size={24} />
          <div>
            <div className="text-xs text-gray-400">Your XP Balance</div>
            <div className="font-bold text-2xl text-purple-400">{balance} XP</div>
          </div>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {ITEMS.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-purple-500/20 hover:border-purple-500/40 transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{item.emoji}</div>
              <div className="text-right">
                <div className="font-bold text-xl text-white">{item.price}</div>
                <div className="text-xs text-gray-400">XP</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="font-bold text-lg text-white">{item.title}</div>
              <div className="text-sm text-gray-400 mt-1">{item.desc}</div>
            </div>

            <div className="flex gap-2">
              <motion.button
                disabled={owned.includes(item.id) || balance < item.price}
                onClick={() => buy(item)}
                whileHover={!owned.includes(item.id) && balance >= item.price ? { scale: 1.05 } : {}}
                whileTap={!owned.includes(item.id) && balance >= item.price ? { scale: 0.95 } : {}}
                className={\`flex-1 px-4 py-2 rounded-lg font-bold transition-all \${
                  owned.includes(item.id)
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : balance < item.price
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                }\`}
              >
                {purchasing === item.id ? 'Purchasing...' : owned.includes(item.id) ? 'Owned' : 'Buy'}
              </motion.button>
              <button className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:border-gray-400 transition-colors">
                Preview
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}`,

  'frontend/src/pages/Profile.jsx': `import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { HiUser, HiPencil, HiCheck, HiXMark } from 'react-icons/hi2';

export default function Profile() {
  const [user, setUser] = useState({ id: 'u1', name: 'Asha', email: 'asha@example.com', xp: 420 });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get('/api/auth/me')
      .then((res) => {
        if (res.data) {
          setUser(res.data);
          setName(res.data.name);
        }
      })
      .catch(() => {
        /* ignore */
      });
  }, []);

  async function save() {
    if (!name.trim()) {
      alert('Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: \`Bearer \${token}\` } : {};
      const res = await axios.post('/api/auth/profile', { name }, { headers });
      if (res.data?.ok) {
        setUser({ ...user, name });
        setEditing(false);
        alert('Profile saved!');
      } else {
        alert(res.data?.error || 'Save failed');
      }
    } catch (e) {
      alert(e.response?.data?.error || e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <HiUser className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Profile</h1>
            <p className="text-sm text-gray-400">Your GaiaQuest account</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-purple-500/30"
        >
          <div className="flex flex-col items-center text-center">
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white mb-4"
              whileHover={{ scale: 1.05 }}
            >
              {user.name?.charAt(0)?.toUpperCase()}
            </motion.div>
            <div className="font-bold text-xl text-white">{user.name}</div>
            <div className="text-sm text-gray-400 mt-1">{user.email}</div>

            <div className="mt-6 w-full pb-6 border-b border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Total XP</div>
              <div className="text-3xl font-bold text-purple-400">{user.xp}</div>
              <div className="text-xs text-gray-400 mt-2">Level {Math.floor(user.xp / 100) + 1}</div>
            </div>

            <div className="mt-6 w-full space-y-2">
              <motion.button
                onClick={() => setEditing(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <HiPencil size={18} />
                Edit Profile
              </motion.button>
              <button
                onClick={() => alert('Logout (demo)')}
                className="w-full py-2 rounded-lg border border-gray-600 text-gray-300 hover:border-gray-400 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </motion.div>

        {/* Edit/Info Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-purple-500/30"
        >
          {editing ? (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  onClick={save}
                  disabled={saving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <HiCheck size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
                <motion.button
                  onClick={() => {
                    setEditing(false);
                    setName(user.name);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  <HiXMark size={18} />
                  Cancel
                </motion.button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Achievements</h2>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-gray-700/30 border border-gray-700">
                  <div className="font-semibold text-white">🌍 Planet Protector</div>
                  <div className="text-sm text-gray-400 mt-1">Earned by completing your first quest</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-700/30 border border-gray-700">
                  <div className="font-semibold text-white">⭐ Rising Star</div>
                  <div className="text-sm text-gray-400 mt-1">Reached level 5</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-700/30 border border-gray-700 opacity-50">
                  <div className="font-semibold text-white">🏆 Leaderboard Champion</div>
                  <div className="text-sm text-gray-400 mt-1">Locked - Reach #1 on leaderboard</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="font-bold text-white mb-2">Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-700/20 rounded-lg">
                    <div className="text-xs text-gray-400">Quests Completed</div>
                    <div className="text-lg font-bold text-purple-400">12</div>
                  </div>
                  <div className="p-3 bg-gray-700/20 rounded-lg">
                    <div className="text-xs text-gray-400">Streak Days</div>
                    <div className="text-lg font-bold text-purple-400">5</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}`,

  'backend/routes/leaderboard.js': `const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

/**
 * Read users from users.json
 * @returns {Array} array of user objects
 */
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

/**
 * GET / - Return leaderboard sorted by xp descending
 */
router.get('/', (req, res) => {
  try {
    const users = readUsers();

    // Sort by xp descending, then by weeklyXp if available
    const leaderboard = users
      .map((u) => ({
        id: u.id,
        name: u.name,
        xp: u.xp || 0,
        weeklyXp: u.weeklyXp || 0,
        avatar: u.avatar || null,
      }))
      .sort((a, b) => {
        if (b.xp !== a.xp) {
          return b.xp - a.xp;
        }
        return b.weeklyXp - a.weeklyXp;
      });

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;`,

  'backend/routes/shop.js': `const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const SHOP_FILE = path.join(__dirname, '..', 'data', 'shop.json');

// Default shop items (fallback if file missing)
const DEFAULT_ITEMS = [
  { id: 'boost1', title: 'Photo Boost', desc: 'Boost your photo acceptance chance by 30%', price: 50 },
  { id: 'hint', title: 'Hint Token', desc: 'Reveal an AI hint in any lesson', price: 25 },
  { id: 'avatar', title: 'Avatar Frame', desc: 'Premium frame for your profile picture', price: 120 },
  { id: 'xp_boost', title: 'XP Doubler', desc: 'Double XP earned for 24 hours', price: 75 },
];

/**
 * Read JSON file synchronously
 * @param {string} file - file path
 * @param {*} defaultValue - fallback value if read fails
 * @returns {*} parsed JSON or defaultValue
 */
function readJSON(file, defaultValue = []) {
  try {
    const data = fs.readFileSync(file, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(\`Error reading \${file}:\`, error);
    return defaultValue;
  }
}

/**
 * Write JSON file synchronously
 * @param {string} file - file path
 * @param {*} data - data to write
 */
function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(\`Error writing \${file}:\`, error);
  }
}

/**
 * GET /items - Return shop items from shop.json (or fallback list)
 */
router.get('/items', (req, res) => {
  try {
    const items = readJSON(SHOP_FILE, DEFAULT_ITEMS);
    res.json(items);
  } catch (error) {
    console.error('Shop items error:', error);
    res.status(500).json({ error: 'Failed to fetch shop items' });
  }
});

/**
 * POST /purchase - Purchase item for user
 * Body: { userId, itemId }
 * Returns: { ok: true, user: { id, name, xp, owned } }
 */
router.post('/purchase', (req, res) => {
  try {
    const { userId, itemId } = req.body;

    // Validate input
    if (!userId || !itemId) {
      return res.status(400).json({ error: 'Missing userId or itemId' });
    }

    // Load users and shop items
    const users = readJSON(USERS_FILE, []);
    const shopItems = readJSON(SHOP_FILE, DEFAULT_ITEMS);

    // Find user
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find shop item
    const item = shopItems.find((i) => i.id === itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Initialize user properties
    user.xp = user.xp || 0;
    user.owned = user.owned || [];

    // Check if user has enough XP
    if (user.xp < item.price) {
      return res.status(400).json({ error: 'Not enough XP' });
    }

    // Process purchase
    user.xp -= item.price;
    if (!user.owned.includes(itemId)) {
      user.owned.push(itemId);
    }

    // Write updated users back to file
    writeJSON(USERS_FILE, users);

    // Return success with updated user summary
    res.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        xp: user.xp,
        owned: user.owned,
      },
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Purchase failed' });
  }
});

module.exports = router;`,
};

const created = [];
const updated = [];
const errors = [];

console.log('📝 Applying GaiaQuest changes...\n');

Object.entries(FILES_TO_CREATE).forEach(([filePath, content]) => {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);

  try {
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const fileExists = fs.existsSync(fullPath);

    // Backup existing file if it exists
    if (fileExists) {
      const backupPath = `${fullPath}.bak`;
      fs.copyFileSync(fullPath, backupPath);
      updated.push(filePath);
      console.log(`✏️  Updated: ${filePath} (backup: ${path.basename(filePath)}.bak)`);
    } else {
      created.push(filePath);
      console.log(`✨ Created: ${filePath}`);
    }

    // Write to temp file first, then rename (atomic write)
    const tmpFile = `${fullPath}.tmp`;
    fs.writeFileSync(tmpFile, content, 'utf-8');
    fs.renameSync(tmpFile, fullPath);

  } catch (err) {
    errors.push({ file: filePath, error: err.message });
    console.error(`❌ Error: ${filePath} - ${err.message}`);
  }
});

// Print summary
console.log('\n' + '='.repeat(60));
console.log('📊 Summary');
console.log('='.repeat(60));
console.log(`✨ Created: ${created.length} file(s)`);
if (created.length > 0) {
  created.forEach((f) => console.log(`  - ${f}`));
}
console.log(`\n✏️  Updated: ${updated.length} file(s)`);
if (updated.length > 0) {
  updated.forEach((f) => console.log(`  - ${f}`));
}

if (errors.length > 0) {
  console.log(`\n❌ Errors: ${errors.length}`);
  errors.forEach((e) => console.log(`  - ${e.file}: ${e.error}`));
  process.exit(1);
} else {
  console.log('\n✅ All files processed successfully!');
  process.exit(0);
}
