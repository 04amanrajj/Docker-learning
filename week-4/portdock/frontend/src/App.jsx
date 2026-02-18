// PortDock Portfolio App Component - Commit 8
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
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>PortDock Portfolio</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Full-Stack Task Observability Dashboard (Fastify + Postgres + Redis + Docker)</p>
            </header>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>Loading Portfolio Dashboard Telemetry...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    <div className="glass-panel pulse-border">
                        <h2>Under Construction</h2>
                        <p>React dashboard structures and cache metric panels compiling...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
