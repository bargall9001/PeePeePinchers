import React, { useState, useEffect } from 'react';
import { Trophy, Award, Users, ArrowRightLeft, Flame, Layers, Swords, Activity, Sliders, Sparkles, RefreshCw, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { LeagueData } from './types';
import { INITIAL_LEAGUE_DATA } from './data/mockLeagueData';
import { Navbar } from './components/Navbar';
import { HeroStats } from './components/HeroStats';
import { StandingsTab } from './components/StandingsTab';
import { PowerRankingsTab } from './components/PowerRankingsTab';
import { RostersTab } from './components/RostersTab';
import { PlayerProjectionsTab } from './components/PlayerProjectionsTab';
import { TradeBuilderTab } from './components/TradeBuilderTab';
import { DisagreementsTab } from './components/DisagreementsTab';
import { VorpScarcityTab } from './components/VorpScarcityTab';
import { MatchupsTab } from './components/MatchupsTab';
import { ActivityTab } from './components/ActivityTab';
import { LeagueSetupModal } from './components/LeagueSetupModal';
import { fetchEspnLeague } from './services/espnApi';
import { getLeagueAvatar } from './utils/images';

const STORAGE_KEY = 'peepee_pinchers_espn_112316640_v8';

export default function App() {
    const [leagueData, setLeagueData] = useState<LeagueData>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load saved league state', e);
        }
        return INITIAL_LEAGUE_DATA;
    });

    const [activeTab, setActiveTab] = useState<string>('standings');
    const [selectedTeamId, setSelectedTeamId] = useState<string>(leagueData.teams[0].id);
    const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [quickEspnInput, setQuickEspnInput] = useState<string>(() => localStorage.getItem('last_espn_input') || '');
    const [quickSyncError, setQuickSyncError] = useState<string | null>(null);
    const [quickSyncSuccess, setQuickSyncSuccess] = useState<string | null>(null);

    // Auto-sync effect
    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const synced = await fetchEspnLeague({ leagueIdOrUrl: '112316640', season: 2026 });
                setLeagueData(synced);
            } catch (err) {
                console.error('Auto-sync failed', err);
            }
        };

        // Initial fetch
        fetchLatest();

        // Poll every 5 minutes
        const interval = setInterval(fetchLatest, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Navigate to Rosters tab and focus a team
    const handleSelectTeam = (teamId: string) => {
        setSelectedTeamId(teamId);
        setActiveTab('rosters');

        // Slight delay to allow DOM to render the new tab before scrolling
        setTimeout(() => {
            const element = document.getElementById('tab-navigation');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 180, behavior: 'smooth' });
            }
        }, 50);
    };

    const handleRefresh = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setLeagueData((prev) => ({
                ...prev,
                lastSynced: `Synced (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
            }));
            setIsSyncing(false);
        }, 600);
    };

    const handleQuickEspnSync = async () => {
        if (!quickEspnInput.trim()) {
            setQuickSyncError('Please enter an ESPN League ID or URL');
            return;
        }
        setIsSyncing(true);
        setQuickSyncError(null);
        setQuickSyncSuccess(null);

        try {
            localStorage.setItem('last_espn_input', quickEspnInput.trim());
            const synced = await fetchEspnLeague({
                leagueIdOrUrl: quickEspnInput.trim(),
                season: 2026,
            });
            setLeagueData(synced);
            if (synced.teams.length > 0) {
                setSelectedTeamId(synced.teams[0].id);
            }
            setQuickSyncSuccess(`Synced "${synced.leagueName}" (${synced.teams.length} teams)`);
        } catch (err: any) {
            setQuickSyncError(err.message || 'Failed to sync ESPN league.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSaveLeagueData = (newData: LeagueData) => {
        setLeagueData(newData);
        if (newData.teams.length > 0) {
            setSelectedTeamId(newData.teams[0].id);
        }
    };

    const handleOpenSettings = () => {
        const pw = window.prompt("Enter admin password:");
        if (pw === "69mislie") {
            setIsConfigOpen(true);
        } else if (pw !== null) {
            alert("Incorrect password.");
        }
    };

    const handleResetDefault = () => {
        if (window.confirm("Are you sure you want to reset all league data to defaults? This will erase imported ESPN data.")) {
            localStorage.removeItem(STORAGE_KEY);
            setLeagueData(INITIAL_LEAGUE_DATA);
            if (INITIAL_LEAGUE_DATA.teams.length > 0) {
                setSelectedTeamId(INITIAL_LEAGUE_DATA.teams[0].id);
            }
        }
    };

    const navTabs = [
        { id: 'standings', label: 'Standings & Odds', icon: Trophy, color: 'text-cyan-400', hoverBg: 'hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400', active: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10' },
        { id: 'power', label: 'Power Rankings', icon: Award, color: 'text-amber-400', hoverBg: 'hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400', active: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10' },
        { id: 'projections', label: 'Player Projections', icon: TrendingUp, color: 'text-indigo-400', hoverBg: 'hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-400', active: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10' },
        { id: 'rosters', label: 'Rosters & Projections', icon: Users, color: 'text-emerald-400', hoverBg: 'hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400', active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10' },
        { id: 'disagreements', label: 'Analyst Disagreements', icon: Flame, color: 'text-rose-400', hoverBg: 'hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400', active: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-500/10' },
        { id: 'vorp', label: 'VORP & Scarcity', icon: Layers, color: 'text-purple-400', hoverBg: 'hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400', active: 'bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-sm shadow-purple-500/10' },
        { id: 'matchups', label: 'Matchups', icon: Swords, color: 'text-orange-400', hoverBg: 'hover:bg-orange-500/10 hover:border-orange-500/30 hover:text-orange-400', active: 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm shadow-orange-500/10' },
        { id: 'activity', label: 'Activity Wire', icon: Activity, color: 'text-blue-400', hoverBg: 'hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400', active: 'bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10' },
    ];

    return (
        <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
            {/* Top Navbar */}
            <Navbar
                leagueData={leagueData}
                onOpenConfig={handleOpenSettings}
                onRefresh={handleRefresh}
                isSyncing={isSyncing}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pb-16">
                {/* Connected League Status Banner */}
                <div className="mt-4 bg-gradient-to-r from-[#0d1322] via-[#111827] to-[#0d1322] border border-cyan-500/30 rounded-xl p-4 shadow-lg space-y-3 transition-colors hidden">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <img
                                src={getLeagueAvatar(leagueData, leagueData.leagueName.includes('PeePee') ? 'PP' : leagueData.leagueName.substring(0, 2))}
                                alt="League Banner Logo"
                                className="w-10 h-10 rounded-xl border border-cyan-500/40 object-cover shadow-md shadow-cyan-950/40 shrink-0"
                            />
                            <div>
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <span>{leagueData.leagueName}</span>
                                    <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30 font-mono font-bold">
                                        ESPN #{leagueData.espnLeagueId || '112316640'}
                                    </span>
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        AUTO-SYNC ENABLED
                                    </span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Connected directly to ESPN League <strong>#112316640</strong>. Auto-updating every 5 minutes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* High-Level Hero Stats (Matches PBPLA header) */}
                <HeroStats leagueData={leagueData} />

                {/* Primary Tab Navigation */}
                <nav id="tab-navigation" className="border-b border-[#1f293d] mb-6 overflow-x-auto scrollbar-none scroll-mt-6">
                    <div className="flex items-center gap-1 min-w-max pb-1">
                        {navTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border border-transparent ${isActive
                                            ? tab.active
                                            : `text-slate-400 ${tab.hoverBg}`
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* Dynamic Tab Views */}
                <div>
                    {activeTab === 'standings' && (
                        <StandingsTab
                            leagueData={leagueData}
                            onSelectTeam={handleSelectTeam}
                        />
                    )}

                    {activeTab === 'power' && (
                        <PowerRankingsTab
                            leagueData={leagueData}
                            onSelectTeam={handleSelectTeam}
                        />
                    )}

                    {activeTab === 'projections' && (
                        <PlayerProjectionsTab
                            leagueData={leagueData}
                            onSelectTeam={handleSelectTeam}
                        />
                    )}

                    {activeTab === 'rosters' && (
                        <RostersTab
                            leagueData={leagueData}
                            selectedTeamId={selectedTeamId}
                            onSelectTeam={setSelectedTeamId}
                        />
                    )}

                    {activeTab === 'disagreements' && (
                        <DisagreementsTab
                            leagueData={leagueData}
                            onSelectTeam={handleSelectTeam}
                        />
                    )}

                    {activeTab === 'vorp' && (
                        <VorpScarcityTab leagueData={leagueData} />
                    )}

                    {activeTab === 'matchups' && (
                        <MatchupsTab
                            leagueData={leagueData}
                            onSelectTeam={handleSelectTeam}
                        />
                    )}

                    {activeTab === 'activity' && (
                        <ActivityTab leagueData={leagueData} />
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[#1f293d] bg-[#0d1322] py-6 px-4 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p>
                        PeePee Pinchers Fantasy Football League • 10 Teams • Inspired by PBLA Analytics
                    </p>
                    <p className="flex items-center gap-2">
                        <span>VORP Baselines: QB 16.4 | RB 10.8 | WR 11.2 | TE 7.5</span>
                        <span>•</span>
                        <button
                            onClick={handleResetDefault}
                            className="text-slate-400 hover:text-cyan-400 transition-colors underline cursor-pointer"
                        >
                            Reset Data
                        </button>
                    </p>
                </div>
            </footer>

            {/* League Setup Modal */}
            <LeagueSetupModal
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
                leagueData={leagueData}
                onSaveLeagueData={handleSaveLeagueData}
                onResetDefault={handleResetDefault}
            />
        </div>
    );
}
