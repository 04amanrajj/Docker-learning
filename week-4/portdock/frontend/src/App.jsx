// PortDock Portfolio App Component - Commit 9
import React, { useState, useEffect } from 'react';

const API_BASE = '/api'; // Proxied dynamically via Nginx gateway context

export default function App() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [cacheMetrics, setCacheMetrics] = useState({
        totalHits: 0,
        totalMisses: 0,
        ratio: '0%',
        activeCachedKeys: 0
    });
    const [lastQuerySource, setLastQuerySource] = useState('NONE');

    // Fetch Tasks & Cache Stats from server
    const fetchDashboardData = async () => {
        try {
            // 1. Fetch Tasks
            const tasksRes = await fetch(`${API_BASE}/tasks`);
            const tasksJson = await tasksRes.json();
            if (tasksJson.success) {
                setTasks(tasksJson.data);
                setLastQuerySource(tasksJson.cache || 'MISS');
            }

            // 2. Fetch Cache Stats
            const cacheRes = await fetch(`${API_BASE}/cache-status`);
            const cacheJson = await cacheRes.json();
            if (cacheJson.success) {
                setCacheMetrics({
                    totalHits: cacheJson.totalHits,
                    totalMisses: cacheJson.totalMisses,
                    ratio: cacheJson.ratio,
                    activeCachedKeys: cacheJson.activeCachedKeys
                });
            }
        } catch (err) {
            console.error('❌ API error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Create a new task
    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        try {
            const res = await fetch(`${API_BASE}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description })
            });
            const json = await res.json();
            if (json.success) {
                setTitle('');
                setDescription('');
                fetchDashboardData();
            }
        } catch (err) {
            console.error('❌ Failed to create task:', err);
        }
    };

    // Mark task as complete
    const handleCompleteTask = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/tasks/${id}/complete`, {
                method: 'PUT'
            });
            const json = await res.json();
            if (json.success) {
                fetchDashboardData();
            }
        } catch (err) {
            console.error('❌ Failed to complete task:', err);
        }
    };

    // Delete a task
    const handleDeleteTask = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/tasks/${id}`, {
                method: 'DELETE'
            });
            const json = await res.json();
            if (json.success) {
                fetchDashboardData();
            }
        } catch (err) {
            console.error('❌ Failed to delete task:', err);
        }
    };

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
            {/* Header section */}
            <header style={{ marginBottom: '40px', textAlign: 'center', position: 'relative' }}>
                <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', marginBottom: '16px', fontSize: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    🎯 WEEK 4 PRODUCTION PORTFOLIO APP
                </div>
                <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '8px' }}>PortDock Analytics</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>High-Performance Fastify, PostgreSQL & Redis Memory Caching Cluster</p>
            </header>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <div style={{ fontSize: '1.2rem', color: 'var(--accent-purple)' }}>Loading Portfolio telemetry details...</div>
                </div>
            ) : (
                <div>
                    {/* Live Query Source Callout Card */}
                    <div className="glass-panel" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `4px solid ${lastQuerySource === 'HIT' ? 'var(--accent-green)' : 'var(--accent-purple)'}` }}>
                        <div>
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>Query Trace Observer</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Tracks real-time database response sources dynamically</p>
                        </div>
                        <div>
                            {lastQuerySource === 'HIT' ? (
                                <span className="badge badge-green" style={{ fontSize: '14px', padding: '8px 16px', boxShadow: '0 0 16px 2px var(--glow-green)' }}>⚡ REDIS CACHE HIT</span>
                            ) : (
                                <span className="badge badge-purple" style={{ fontSize: '14px', padding: '8px 16px', boxShadow: '0 0 16px 2px var(--glow-purple)' }}>🐘 POSTGRESQL DB MISS</span>
                            )}
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                        <div className="glass-panel" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>DATABASE CLIENTS</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-blue)' }}>Postgres + Redis</div>
                            <div style={{ fontSize: '12px', color: 'var(--accent-green)', marginTop: '6px' }}>● Status: Healthy</div>
                        </div>
                        <div className="glass-panel" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>TOTAL CACHE HITS</div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold' }} className="gradient-text">{cacheMetrics.totalHits}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>Fastify Memory Pool</div>
                        </div>
                        <div className="glass-panel" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>TOTAL CACHE MISSES</div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold' }} className="gradient-text">{cacheMetrics.totalMisses}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>Relational Fallbacks</div>
                        </div>
                        <div className="glass-panel" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>CACHE HIT RATIO</div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--accent-green)' }}>{cacheMetrics.ratio}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>Optimal Target Ratio: 90%+</div>
                        </div>
                    </div>

                    {/* Content Section: Form and List split */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
                        {/* Task Form Column */}
                        <div>
                            <div className="glass-panel" style={{ position: 'sticky', top: '20px' }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Create Task</h2>
                                <form onSubmit={handleCreateTask}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>Task Title</label>
                                        <input 
                                            type="text" 
                                            value={title} 
                                            onChange={(e) => setTitle(e.target.value)} 
                                            placeholder="e.g. Set up CI/CD pipeline..." 
                                            required
                                        />
                                    </div>
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>Description</label>
                                        <textarea 
                                            value={description} 
                                            onChange={(e) => setDescription(e.target.value)} 
                                            placeholder="Specify task technical specs..." 
                                            rows="4"
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }}>
                                        ➕ Push Task into Cluster
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Task List Column */}
                        <div>
                            <div className="glass-panel">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h2 style={{ fontSize: '1.5rem' }}>Active Tasks</h2>
                                    <button 
                                        onClick={fetchDashboardData} 
                                        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)', padding: '6px 12px', fontSize: '14px' }}
                                    >
                                        🔄 Reload Scrape
                                    </button>
                                </div>

                                {tasks.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                        No tasks found. Create one to test in-memory cache transitions!
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {tasks.map(task => (
                                            <div 
                                                key={task.id} 
                                                className="glass-panel" 
                                                style={{ 
                                                    padding: '20px', 
                                                    background: 'rgba(10, 12, 16, 0.4)', 
                                                    borderLeft: `3px solid ${task.completed ? 'var(--accent-green)' : 'var(--accent-blue)'}`
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                    <h3 style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                                                        {task.title}
                                                    </h3>
                                                    {task.completed ? (
                                                        <span className="badge badge-green">COMPLETED</span>
                                                    ) : (
                                                        <span className="badge badge-blue">PENDING</span>
                                                    )}
                                                </div>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>{task.description}</p>
                                                
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    {!task.completed && (
                                                        <button 
                                                            onClick={() => handleCompleteTask(task.id)}
                                                            style={{ background: 'var(--accent-green)', color: '#000000', padding: '8px 12px', fontSize: '13px' }}
                                                        >
                                                            ✓ Complete
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        style={{ background: 'rgba(248, 81, 73, 0.15)', color: '#ff6b6b', border: '1px solid rgba(248, 81, 73, 0.3)', padding: '8px 12px', fontSize: '13px' }}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
