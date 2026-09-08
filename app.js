const { useState, useEffect, useRef } = React;

// Custom Hook: Click Outside Handler
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// Lucide Icon Helper Component
const Icon = ({ name, className = "w-5 h-5", size }) => {
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, [name]);

  return <i data-lucide={name} className={className} style={size ? { width: size, height: size } : {}}></i>;
};

// Toast Component
const Toast = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl fade-in border border-slate-800">
      <Icon name="check-circle" className="w-5 h-5 text-emerald-400" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white">
        <Icon name="x" className="w-4 h-4" />
      </button>
    </div>
  );
};

// ----------------------------------------------------------------------
// MAIN APPLICATION COMPONENT
// ----------------------------------------------------------------------
function App() {
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Accounts Database State
  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('studymate_accounts');
    return saved ? JSON.parse(saved) : [
      { name: 'Praise Student', email: 'praise@university.edu', password: 'password123', grade: 'Undergraduate' }
    ];
  });

  // Current Logged-In User State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('studymate_user');
    return saved ? JSON.parse(saved) : { name: 'Praise Student', email: 'praise@university.edu' };
  });

  useEffect(() => {
    localStorage.setItem('studymate_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('studymate_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleNavigate = (route) => {
    if (route.startsWith('auth-')) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
    setCurrentRoute(route);
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentRoute('auth-login');
    showToast('Logged out successfully');
  };

  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
    setIsAuthenticated(true);
    setCurrentRoute('dashboard');
    showToast(`Welcome back, ${userObj.name}! 👋`);
  };

  const handleSignUpSuccess = (newAcc) => {
    setAccounts((prev) => [...prev, newAcc]);
    setCurrentUser({ name: newAcc.name, email: newAcc.email });
    setIsAuthenticated(true);
    setCurrentRoute('dashboard');
    showToast(`Account created successfully! Welcome, ${newAcc.name}! 🎉`);
  };

  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, [currentRoute, isAuthenticated, notificationsOpen, userDropdownOpen, currentUser]);

  if (!isAuthenticated || currentRoute.startsWith('auth-')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
        {currentRoute === 'auth-login' && (
          <AuthLogin 
            accounts={accounts}
            onLoginSuccess={handleLoginSuccess}
            onNavigate={handleNavigate} 
            showToast={showToast} 
          />
        )}
        {currentRoute === 'auth-signup' && (
          <AuthSignUp 
            accounts={accounts}
            onSignUpSuccess={handleSignUpSuccess}
            onNavigate={handleNavigate} 
            showToast={showToast} 
          />
        )}
        {currentRoute === 'auth-forgot-password' && (
          <AuthForgotPassword 
            accounts={accounts}
            onNavigate={handleNavigate} 
            showToast={showToast} 
          />
        )}
        {currentRoute === 'auth-welcome' && (
          <AuthLanding onNavigate={handleNavigate} />
        )}
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 font-sans">
      {/* Sidebar */}
      <Sidebar 
        currentRoute={currentRoute} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onUpgrade={() => setUpgradeModalOpen(true)}
      />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <Header 
          currentRoute={currentRoute}
          currentUser={currentUser}
          onNavigate={handleNavigate}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          userDropdownOpen={userDropdownOpen}
          setUserDropdownOpen={setUserDropdownOpen}
          onLogout={handleLogout}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto fade-in">
          {currentRoute === 'dashboard' && <DashboardView currentUser={currentUser} onNavigate={handleNavigate} />}
          {currentRoute === 'ask-ai' && <AskAIView showToast={showToast} />}
          {currentRoute === 'quiz' && <QuizView onNavigate={handleNavigate} showToast={showToast} />}
          {currentRoute === 'study-plan' && <StudyPlanView showToast={showToast} />}
          {currentRoute === 'progress' && <ProgressView onNavigate={handleNavigate} />}
          {currentRoute === 'settings' && <SettingsView currentUser={currentUser} setCurrentUser={setCurrentUser} showToast={showToast} />}
        </main>
      </div>

      {/* Upgrade Modal */}
      {upgradeModalOpen && (
        <UpgradeModal onClose={() => setUpgradeModalOpen(false)} showToast={showToast} />
      )}

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
}

// ----------------------------------------------------------------------
// SIDEBAR COMPONENT
// ----------------------------------------------------------------------
function Sidebar({ currentRoute, onNavigate, onLogout, mobileMenuOpen, setMobileMenuOpen, onUpgrade }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'ask-ai', label: 'Ask AI', icon: 'message-square' },
    { id: 'quiz', label: 'Take Quiz', icon: 'check-square' },
    { id: 'study-plan', label: 'Study Plan', icon: 'calendar' },
    { id: 'progress', label: 'Progress', icon: 'bar-chart-3' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <>
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed md:static top-0 left-0 bottom-0 z-50
        w-64 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between
        transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        transition-transform duration-300 ease-in-out shrink-0 select-none
      `}>
        <div>
          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 px-2 py-2 mb-8 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Icon name="graduation-cap" className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              StudyMate <span className="text-indigo-600">AI</span>
            </span>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 translate-x-1' 
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'}
                  `}
                >
                  <Icon name={item.icon} className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors mt-4"
            >
              <Icon name="log-out" className="w-5 h-5 text-slate-500 group-hover:text-rose-600" />
              <span>Logout</span>
            </button>
          </nav>
        </div>

        <div className="mt-6 p-4 rounded-3xl bg-gradient-to-b from-indigo-50/70 to-indigo-100/50 border border-indigo-100 relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-amber-500 text-lg">👑</span>
            <h4 className="font-bold text-sm text-indigo-950">Upgrade to Pro</h4>
          </div>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Unlock unlimited AI answers, quizzes and advanced features.
          </p>
          <button 
            onClick={onUpgrade}
            className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-1.5 group-hover:shadow-indigo-300"
          >
            <span>Upgrade Now</span>
            <Icon name="arrow-right" className="w-3.5 h-3.5" />
          </button>
          
          <div className="mt-3 flex justify-center">
            <img 
              src="assets/book_stack.png" 
              alt="Book stack" 
              className="h-16 object-contain drop-shadow-md transform group-hover:scale-105 transition-transform" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>
      </aside>
    </>
  );
}

// ----------------------------------------------------------------------
// HEADER COMPONENT
// ----------------------------------------------------------------------
function Header({ currentRoute, currentUser, onNavigate, mobileMenuOpen, setMobileMenuOpen, notificationsOpen, setNotificationsOpen, userDropdownOpen, setUserDropdownOpen, onLogout }) {
  const notifRef = useRef();
  const userRef = useRef();

  useClickOutside(notifRef, () => setNotificationsOpen(false));
  useClickOutside(userRef, () => setUserDropdownOpen(false));

  const displayName = currentUser?.name || 'Student';
  const firstName = displayName.split(' ')[0];

  const getTitle = () => {
    switch (currentRoute) {
      case 'dashboard': return { main: `Welcome back, ${firstName}! 👋`, sub: 'What would you like to do today?' };
      case 'ask-ai': return { main: 'Ask AI', sub: 'Get instant help with any academic question.' };
      case 'quiz': return { main: 'Take Quiz', sub: 'Test your knowledge and improve your understanding.' };
      case 'study-plan': return { main: 'Study Plan', sub: 'Your personalized weekly study plan.' };
      case 'progress': return { main: 'Progress & Analytics', sub: 'Track your learning milestones and performance.' };
      case 'settings': return { main: 'Settings', sub: 'Manage your profile and study preferences.' };
      default: return { main: 'StudyMate AI', sub: 'Smart Learning Companion' };
    }
  };

  const titleInfo = getTitle();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
        >
          <Icon name="menu" className="w-6 h-6" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {titleInfo.main}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
            {titleInfo.sub}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 relative">
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setUserDropdownOpen(false);
            }}
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-slate-700 transition-colors relative"
          >
            <Icon name="bell" className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white">
              3
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h4 className="font-bold text-sm text-slate-900">Notifications</h4>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3 text-xs p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Icon name="check-circle" className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Quiz Completed!</p>
                    <p className="text-slate-500">You scored 8/10 on Biology Basics.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">10 mins ago</span>
                  </div>
                </div>

                <div className="flex gap-3 text-xs p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Icon name="calendar" className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Study Reminder</p>
                    <p className="text-slate-500">Calculus I review scheduled for today.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                  </div>
                </div>

                <div className="flex gap-3 text-xs p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Icon name="award" className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Milestone Unlocked</p>
                    <p className="text-slate-500">7-Day Study Streak achieved! 🔥</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Yesterday</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userRef}>
          <button 
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 overflow-hidden border border-indigo-200 flex items-center justify-center shrink-0">
              <img 
                src="assets/hero_student.png" 
                alt={displayName} 
                className="w-full h-full object-cover object-top"
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
              <span className="font-bold text-sm text-indigo-700">{firstName.charAt(0)}</span>
            </div>
            <span className="font-bold text-sm text-slate-800">{firstName}</span>
            <Icon name="chevron-down" className="w-4 h-4 text-slate-400" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 fade-in">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="font-bold text-sm text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500">{currentUser?.email || 'student@university.edu'}</p>
              </div>
              <button 
                onClick={() => onNavigate('settings')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Icon name="user" className="w-4 h-4 text-slate-500" />
                <span>My Profile</span>
              </button>
              <button 
                onClick={() => onNavigate('progress')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Icon name="bar-chart-2" className="w-4 h-4 text-slate-500" />
                <span>My Analytics</span>
              </button>
              <div className="my-1 border-t border-slate-100"></div>
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                <Icon name="log-out" className="w-4 h-4 text-rose-600" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ----------------------------------------------------------------------
// DASHBOARD VIEW (Study 2 Prototype)
// ----------------------------------------------------------------------
function DashboardView({ currentUser, onNavigate }) {
  const firstName = (currentUser?.name || 'Student').split(' ')[0];

  const recentActivities = [
    {
      id: 1,
      title: "Asked: What is Photosynthesis?",
      subtitle: "AI Answered",
      time: "10:30 AM",
      icon: "message-square",
      color: "bg-indigo-100 text-indigo-600",
      actionRoute: "ask-ai"
    },
    {
      id: 2,
      title: "Completed Quiz: Biology Basics",
      subtitle: "Score: 8/10",
      time: "9:15 AM",
      icon: "check-square",
      color: "bg-emerald-100 text-emerald-600",
      actionRoute: "quiz"
    },
    {
      id: 3,
      title: "Study Plan Updated",
      subtitle: "Biology - Chapter 2 Added",
      time: "Yesterday",
      icon: "calendar",
      color: "bg-sky-100 text-sky-600",
      actionRoute: "study-plan"
    },
    {
      id: 4,
      title: "Progress Milestone Achieved",
      subtitle: "Keep up the great work!",
      time: "Yesterday",
      icon: "bar-chart-3",
      color: "bg-amber-100 text-amber-600",
      actionRoute: "progress"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Icon name="message-square" className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-1">Ask AI</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Get instant answers to any academic question.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('ask-ai')}
            className="w-full py-2.5 px-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Go Now</span>
            <Icon name="arrow-right" className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Icon name="check-square" className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-1">Take Quiz</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Test your knowledge with practice quizzes.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('quiz')}
            className="w-full py-2.5 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Start Quiz</span>
            <Icon name="arrow-right" className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Icon name="calendar" className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-1">Study Plan</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Get a personalized study plan that fits you.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('study-plan')}
            className="w-full py-2.5 px-4 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View Plan</span>
            <Icon name="arrow-right" className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Icon name="bar-chart-3" className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-1">Progress</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Track your learning progress and achievements.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('progress')}
            className="w-full py-2.5 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>See Progress</span>
            <Icon name="arrow-right" className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Icon name="target" className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Today's Goal</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 my-2">
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke="#EEF2FF" strokeWidth="10" 
                  fill="transparent" 
                />
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke="#4F46E5" strokeWidth="10" 
                  strokeDasharray="251.2" 
                  strokeDashoffset="62.8" 
                  strokeLinecap="round" 
                  fill="transparent" 
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-slate-900 block leading-none">75%</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1 block">Completed</span>
              </div>
            </div>

            <div className="space-y-4 text-center sm:text-left flex-1">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Almost there, {firstName}! Keep going and achieve your daily goal.
              </p>
              <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100/60 inline-block w-full">
                <span className="text-indigo-700 font-extrabold text-lg block">3 / 4</span>
                <span className="text-slate-600 text-xs font-semibold">Tasks Completed</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => onNavigate('study-plan')}
            className="w-full mt-6 py-3 px-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View My Tasks</span>
            <Icon name="arrow-right" className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Icon name="activity" className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Recent Activity</h3>
              </div>
              <button 
                onClick={() => onNavigate('progress')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {recentActivities.map((act) => (
                <div 
                  key={act.id} 
                  onClick={() => onNavigate(act.actionRoute)}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${act.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon name={act.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {act.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {act.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 shrink-0">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-100/60 p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5 z-10 text-center sm:text-left">
          <div className="w-16 h-16 shrink-0 flex items-center justify-center">
            <img 
              src="assets/trophy.png" 
              alt="Gold Trophy" 
              className="w-full h-full object-contain animate-float"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-indigo-950 mb-1">
              Consistency is the key to success!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Keep learning every day and achieve your goals.
            </p>
          </div>
        </div>

        <div className="w-20 h-20 shrink-0 flex items-center justify-center z-10">
          <img 
            src="assets/robot_wave.png" 
            alt="Robot Buddy" 
            className="w-full h-full object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// ASK AI CHAT VIEW (Study 3 Prototype)
// ----------------------------------------------------------------------
function AskAIView({ showToast }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'user',
      text: 'What is Photosynthesis?',
      time: '10:23 AM'
    },
    {
      id: 2,
      sender: 'ai',
      text: 'Photosynthesis is the process by which green plants and some other organisms use sunlight, water, and carbon dioxide to make their own food (glucose). This process takes place in the chloroplasts of plant cells and releases oxygen as a by-product.',
      hasDiagram: true,
      keyPoints: [
        'It occurs in the leaves of plants.',
        'It requires sunlight, water, and carbon dioxide.',
        'Chlorophyll helps to absorb sunlight.',
        'Oxygen is released as a by-product.'
      ],
      liked: false,
      disliked: false,
      time: '10:23 AM'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (queryToSend) => {
    const q = queryToSend || inputQuery;
    if (!q.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!queryToSend) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let aiText = `Here is a detailed explanation for your question: "${q}".`;
      let points = [
        "Core concept analyzed step-by-step.",
        "Key formulas and definitions highlighted.",
        "Practical academic applications reviewed."
      ];

      if (q.toLowerCase().includes('cell') || q.toLowerCase().includes('biology')) {
        aiText = "Cells are the basic structural, functional, and biological units of all known organisms. A cell is the smallest unit of life.";
        points = [
          "Organelles carry out specialized tasks within the cell.",
          "Mitochondria produce cellular ATP energy.",
          "DNA is housed within the cell nucleus."
        ];
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiText,
        keyPoints: points,
        liked: false,
        disliked: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  const handleSpeech = (id, text) => {
    if ('speechSynthesis' in window) {
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setSpeakingId(null);
        window.speechSynthesis.speak(utterance);
        setSpeakingId(id);
        showToast('Playing audio explanation...');
      }
    } else {
      showToast('Text-to-speech not supported on this browser');
    }
  };

  const toggleReaction = (id, type) => {
    setMessages((prev) => prev.map((m) => {
      if (m.id === id) {
        if (type === 'like') return { ...m, liked: !m.liked, disliked: false };
        if (type === 'dislike') return { ...m, disliked: !m.disliked, liked: false };
      }
      return m;
    }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className="fade-in">
            {msg.sender === 'user' ? (
              <div className="flex flex-col items-end">
                <div className="bg-indigo-600 text-white px-5 py-3.5 rounded-3xl rounded-tr-sm max-w-lg shadow-md shadow-indigo-100 text-sm font-semibold leading-relaxed">
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1 mr-2">
                  {msg.time}
                </span>
              </div>
            ) : (
              <div className="flex gap-4 items-start max-w-3xl">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 overflow-hidden border border-indigo-200 flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <img 
                    src="assets/bot_head.png" 
                    alt="AI Bot Avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <Icon name="bot" className="w-5 h-5 text-indigo-600" />
                </div>

                <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-5 relative">
                  <button 
                    onClick={() => handleSpeech(msg.id, msg.text)}
                    className={`absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors ${speakingId === msg.id ? 'text-indigo-600 bg-indigo-50 animate-pulse' : ''}`}
                    title="Listen explanation"
                  >
                    <Icon name="volume-2" className="w-5 h-5" />
                  </button>

                  <p className="text-sm text-slate-700 leading-relaxed font-medium pr-8">
                    {msg.text}
                  </p>

                  {msg.hasDiagram && (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50/50 p-2 flex justify-center">
                      <img 
                        src="assets/photosynthesis_diagram.png" 
                        alt="Photosynthesis Diagram" 
                        className="max-h-64 object-contain rounded-xl"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}

                  {msg.keyPoints && (
                    <div className="bg-indigo-50/60 p-4 sm:p-5 rounded-2xl border border-indigo-100/80 space-y-2.5">
                      <h4 className="font-bold text-xs text-indigo-950 uppercase tracking-wider">
                        Key Points:
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-700 font-medium">
                        {msg.keyPoints.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400">
                      <button 
                        onClick={() => handleCopy(msg.text)}
                        className="p-1.5 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Copy text"
                      >
                        <Icon name="copy" className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleReaction(msg.id, 'like')}
                        className={`p-1.5 rounded-lg transition-colors ${msg.liked ? 'text-emerald-600 bg-emerald-50' : 'hover:text-slate-700 hover:bg-slate-100'}`}
                        title="Helpful"
                      >
                        <Icon name="thumbs-up" className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleReaction(msg.id, 'dislike')}
                        className={`p-1.5 rounded-lg transition-colors ${msg.disliked ? 'text-rose-600 bg-rose-50' : 'hover:text-slate-700 hover:bg-slate-100'}`}
                        title="Not helpful"
                      >
                        <Icon name="thumbs-down" className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleSpeech(msg.id, msg.text)}
                        className="p-1.5 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Audio speech"
                      >
                        <Icon name="volume-2" className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {msg.time}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-4 items-center text-slate-400 text-xs font-semibold fade-in">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Icon name="bot" className="w-4 h-4 text-indigo-600 animate-spin" />
            </div>
            <span>StudyMate AI is generating response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {['Explain Quantum Physics', 'Derive Quadratic Formula', 'Cell Mitosis vs Meiosis'].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="text-xs bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-sm transition-all"
          >
            💡 {prompt}
          </button>
        ))}
      </div>

      <div className="bg-white p-3 rounded-3xl border border-slate-200/80 shadow-lg flex items-center gap-3">
        <input 
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your question here..."
          className="flex-1 px-4 py-2 text-sm bg-transparent focus:outline-none text-slate-800 placeholder-slate-400 font-medium"
        />
        <button 
          onClick={() => handleSend()}
          disabled={!inputQuery.trim()}
          className="py-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-200 transition-all shrink-0"
        >
          <span>Send</span>
          <Icon name="send" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// STUDY PLAN VIEW (Study 4 Prototype)
// ----------------------------------------------------------------------
function StudyPlanView({ showToast }) {
  const [activeTab, setActiveTab] = useState('weekly');

  const scheduleData = [
    {
      day: 'Monday',
      course: 'Calculus I',
      code: 'MATH 101',
      topic: 'Limits and Continuity',
      task: 'Read textbook + Practice Problems',
      duration: '2.5 hrs',
      badgeColor: 'bg-indigo-600 text-white',
      clockColor: 'text-indigo-600'
    },
    {
      day: 'Tuesday',
      course: 'Physics I',
      code: 'PHYS 101',
      topic: 'Kinematics in One Dimension',
      task: 'Lecture Notes + Problem Set',
      duration: '2 hrs',
      badgeColor: 'bg-emerald-600 text-white',
      clockColor: 'text-emerald-600'
    },
    {
      day: 'Wednesday',
      course: 'Data Structures',
      code: 'CS 201',
      topic: 'Arrays and Linked Lists',
      task: 'Review Lecture + Coding Practice',
      duration: '2.5 hrs',
      badgeColor: 'bg-sky-600 text-white',
      clockColor: 'text-sky-600'
    },
    {
      day: 'Thursday',
      course: 'Introduction to Economics',
      code: 'ECON 101',
      topic: 'Supply and Demand',
      task: 'Read Chapter + Quiz',
      duration: '2 hrs',
      badgeColor: 'bg-amber-600 text-white',
      clockColor: 'text-amber-600'
    },
    {
      day: 'Friday',
      course: 'Linear Algebra',
      code: 'MATH 201',
      topic: 'Matrices and Systems of Equations',
      task: 'Problem Set + Review',
      duration: '2.5 hrs',
      badgeColor: 'bg-rose-600 text-white',
      clockColor: 'text-rose-600'
    },
    {
      day: 'Saturday',
      course: 'Computer Organization',
      code: 'CS 202',
      topic: 'CPU Architecture and Instruction Set',
      task: 'Read Notes + Practice Questions',
      duration: '2 hrs',
      badgeColor: 'bg-indigo-600 text-white',
      clockColor: 'text-indigo-600'
    },
    {
      day: 'Sunday',
      course: 'Academic Writing',
      code: 'ENG 101',
      topic: 'Research Papers and Citations',
      task: 'Write Outline + Peer Review',
      duration: '1.5 hrs',
      badgeColor: 'bg-amber-500 text-white',
      clockColor: 'text-amber-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2 max-w-md">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'weekly' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Weekly Plan
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'calendar' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Calendar View
        </button>
        <button
          onClick={() => setActiveTab('deadlines')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'deadlines' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Upcoming Deadlines
        </button>
      </div>

      {activeTab === 'weekly' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-4 px-6">Day</th>
                  <th className="py-4 px-6">Course</th>
                  <th className="py-4 px-6">Topic / Focus</th>
                  <th className="py-4 px-6">Task</th>
                  <th className="py-4 px-6">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {scheduleData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg ${row.badgeColor} flex items-center justify-center shrink-0 shadow-xs`}>
                          <Icon name="book-open" className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900">{row.day}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-slate-900">{row.course}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{row.code}</p>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-600">{row.topic}</td>
                    <td className="py-4 px-6 text-slate-600">{row.task}</td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <Icon name="clock" className={`w-4 h-4 ${row.clockColor}`} />
                        <span className={`font-bold ${row.clockColor}`}>{row.duration}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-base text-slate-900">September 2026</h3>
            <div className="flex gap-2">
              <button className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
                <Icon name="chevron-left" className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
                <Icon name="chevron-right" className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="font-bold text-slate-400 uppercase py-2">{d}</div>
            ))}
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
              <div key={day} className={`p-3 rounded-2xl border ${day === 8 ? 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-md' : 'border-slate-100 hover:bg-slate-50 text-slate-700'}`}>
                <span>{day}</span>
                {day % 3 === 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block mx-auto mt-1"></span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'deadlines' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4 fade-in">
          <h3 className="font-bold text-base text-slate-900 mb-4">Assignments & Exams</h3>
          {[
            { title: "Calculus I Problem Set #4", due: "Tomorrow, 11:59 PM", subject: "MATH 101", color: "border-rose-500" },
            { title: "Physics Lab Report #2", due: "Friday, Sep 11", subject: "PHYS 101", color: "border-amber-500" },
            { title: "Data Structures Coding Project", due: "Sunday, Sep 13", subject: "CS 201", color: "border-indigo-500" },
          ].map((item, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border-l-4 ${item.color} bg-slate-50 flex items-center justify-between`}>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-500">{item.subject} • Due {item.due}</p>
              </div>
              <button 
                onClick={() => showToast('Marked as complete!')}
                className="py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Mark Complete
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-indigo-50/70 p-5 rounded-3xl border border-indigo-100 flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
          <Icon name="calendar" className="w-5 h-5" />
        </div>
        <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
          <strong className="text-indigo-950 font-bold">Stay consistent and you will achieve your goals! 💪</strong> Keep up the great work and happy learning!
        </p>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// TAKE QUIZ VIEW (Study 5 Prototype)
// ----------------------------------------------------------------------
function QuizView({ onNavigate, showToast }) {
  const quizQuestions = [
    {
      id: 1,
      question: "What is the powerhouse of the cell?",
      options: [
        { key: 'A', text: 'Nucleus' },
        { key: 'B', text: 'Mitochondria' },
        { key: 'C', text: 'Ribosome' },
        { key: 'D', text: 'Golgi Apparatus' }
      ],
      correctKey: 'B',
      explanation: "Mitochondria is known as the powerhouse of the cell because it produces energy in the form of ATP."
    },
    {
      id: 2,
      question: "Which organelle contains the cell's genetic material (DNA)?",
      options: [
        { key: 'A', text: 'Nucleus' },
        { key: 'B', text: 'Chloroplast' },
        { key: 'C', text: 'Endoplasmic Reticulum' },
        { key: 'D', text: 'Lysosome' }
      ],
      correctKey: 'A',
      explanation: "The nucleus houses chromosomes and controls gene expression in eukaryotic cells."
    },
    {
      id: 3,
      question: "Which pigment absorbs light energy during photosynthesis in plants?",
      options: [
        { key: 'A', text: 'Carotene' },
        { key: 'B', text: 'Hemoglobin' },
        { key: 'C', text: 'Chlorophyll' },
        { key: 'D', text: 'Melanin' }
      ],
      correctKey: 'C',
      explanation: "Chlorophyll is the green pigment in chloroplasts that absorbs light energy for photosynthesis."
    },
    {
      id: 4,
      question: "What is the primary function of ribosomes in a cell?",
      options: [
        { key: 'A', text: 'Lipid synthesis' },
        { key: 'B', text: 'Protein synthesis' },
        { key: 'C', text: 'DNA replication' },
        { key: 'D', text: 'Waste destruction' }
      ],
      correctKey: 'B',
      explanation: "Ribosomes translate mRNA sequences to synthesize cellular proteins."
    },
    {
      id: 5,
      question: "Which process moves water molecules across a selectively permeable membrane?",
      options: [
        { key: 'A', text: 'Active Transport' },
        { key: 'B', text: 'Osmosis' },
        { key: 'C', text: 'Phagocytosis' },
        { key: 'D', text: 'Exocytosis' }
      ],
      correctKey: 'B',
      explanation: "Osmosis is the net movement of solvent (water) across a semipermeable membrane from low to high solute concentration."
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({ 0: 'B' });
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQ = quizQuestions[currentIndex];
  const selectedKey = userAnswers[currentIndex];
  const isAnswered = selectedKey !== undefined;
  const isCorrect = isAnswered && selectedKey === currentQ.correctKey;

  const handleSelectOption = (key) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: key
    }));
  };

  const handleNext = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setQuizFinished(true);
      showToast('Quiz Completed! 🎉');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const calculateScore = () => {
    let count = 0;
    quizQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctKey) count++;
    });
    return count;
  };

  if (quizFinished) {
    const finalScore = calculateScore();
    return (
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-card max-w-2xl mx-auto text-center space-y-6 fade-in">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-md">
          🏆
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Quiz Complete!</h2>
          <p className="text-sm text-slate-500 mt-1">Biology Basics Practice Test</p>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 max-w-sm mx-auto">
          <span className="text-4xl font-extrabold text-indigo-600 block mb-1">
            {finalScore} / {quizQuestions.length}
          </span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {finalScore >= 4 ? 'Excellent Performance! 🌟' : 'Good Effort! Keep Reviewing!'}
          </span>
        </div>

        <div className="flex gap-4 justify-center pt-2">
          <button
            onClick={() => {
              setQuizFinished(false);
              setCurrentIndex(0);
              setUserAnswers({});
            }}
            className="py-3 px-6 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Retake Quiz
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Icon name="arrow-left" className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-base text-slate-900">Take Quiz</h2>
            <p className="text-xs text-slate-500">Test your knowledge and improve your understanding.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
          <Icon name="trophy" className="w-5 h-5 text-indigo-600" />
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">Score</span>
            <span className="font-extrabold text-sm text-indigo-900">{calculateScore()} / {quizQuestions.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>Question {currentIndex + 1} of {quizQuestions.length}</span>
            <span>{Math.round(((currentIndex + 1) / quizQuestions.length) * 100)}% Completed</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 leading-snug">
          {currentQ.question}
        </h3>

        <div className="space-y-3">
          {currentQ.options.map((opt) => {
            const isSelected = selectedKey === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => handleSelectOption(opt.key)}
                className={`
                  w-full p-4 rounded-2xl border text-left font-semibold text-sm transition-all duration-200 flex items-center gap-3.5
                  ${isSelected 
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-600/20 shadow-sm' 
                    : 'border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'}
                `}
              >
                <div className={`
                  w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors
                  ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'}
                `}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
                <span>{opt.key}. {opt.text}</span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className={`p-5 rounded-2xl border fade-in flex items-start gap-3.5 ${
            isCorrect 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
              : 'bg-rose-50/80 border-rose-200 text-rose-950'
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
              isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
              <Icon name={isCorrect ? "check" : "x"} className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1">
                {isCorrect ? "Correct! 🎉" : "Incorrect"}
              </h4>
              <p className="text-xs leading-relaxed font-medium">
                {currentQ.explanation}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="py-3 px-5 rounded-2xl border border-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
          >
            <Icon name="arrow-left" className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-200 flex items-center gap-1.5 transition-all"
          >
            <span>{currentIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next'}</span>
            <Icon name="arrow-right" className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-indigo-50/70 p-4 rounded-3xl border border-indigo-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
          <Icon name="lightbulb" className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-xs text-indigo-950">Keep it up!</h4>
          <p className="text-xs text-slate-600">You're doing great. One more step to complete the quiz.</p>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// PROGRESS VIEW
// ----------------------------------------------------------------------
function ProgressView({ onNavigate }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card">
          <span className="text-2xl mb-2 block">🔥</span>
          <span className="text-2xl font-extrabold text-slate-900 block">14 Days</span>
          <span className="text-xs font-semibold text-slate-500">Current Study Streak</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card">
          <span className="text-2xl mb-2 block">⏱️</span>
          <span className="text-2xl font-extrabold text-slate-900 block">42.5 hrs</span>
          <span className="text-xs font-semibold text-slate-500">Total Hours Studied</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card">
          <span className="text-2xl mb-2 block">📝</span>
          <span className="text-2xl font-extrabold text-slate-900 block">18 Quizzes</span>
          <span className="text-xs font-semibold text-slate-500">Completed Quizzes</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card">
          <span className="text-2xl mb-2 block">🏆</span>
          <span className="text-2xl font-extrabold text-indigo-600 block">88%</span>
          <span className="text-xs font-semibold text-slate-500">Average Quiz Score</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-5">
        <h3 className="font-bold text-base text-slate-900">Subject Mastery & Confidence</h3>
        <div className="space-y-4">
          {[
            { subject: "Biology", score: 92, color: "bg-emerald-500" },
            { subject: "Computer Science", score: 95, color: "bg-indigo-600" },
            { subject: "Calculus", score: 85, color: "bg-sky-500" },
            { subject: "Economics", score: 80, color: "bg-amber-500" },
            { subject: "Physics", score: 78, color: "bg-rose-500" }
          ].map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>{item.subject}</span>
                <span>{item.score}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.score}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SETTINGS VIEW
// ----------------------------------------------------------------------
function SettingsView({ currentUser, setCurrentUser, showToast }) {
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSave = () => {
    setCurrentUser({ name, email });
    showToast('Profile updated successfully!');
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card max-w-3xl space-y-6">
      <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-4">Account & Study Preferences</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-600" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Student Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-600" 
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <p className="font-bold text-sm text-slate-900">Daily Reminders</p>
            <p className="text-xs text-slate-500">Receive notifications for study tasks & goals.</p>
          </div>
          <button 
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`w-12 h-6 rounded-full transition-colors p-1 ${notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all"
      >
        Save Changes
      </button>
    </div>
  );
}

// ----------------------------------------------------------------------
// UPGRADE MODAL COMPONENT
// ----------------------------------------------------------------------
function UpgradeModal({ onClose, showToast }) {
  const modalRef = useRef();
  useClickOutside(modalRef, onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm fade-in">
      <div ref={modalRef} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-slate-100 text-center space-y-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
          <Icon name="x" className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-lg shadow-indigo-200 text-white">
          👑
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-slate-900">StudyMate Pro</h3>
          <p className="text-xs text-slate-500 mt-1">Unlock your full academic potential.</p>
        </div>

        <div className="space-y-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-medium text-slate-700">
          <div className="flex items-center gap-2">
            <Icon name="check" className="w-4 h-4 text-emerald-500" />
            <span>Unlimited AI Question Answers</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="check" className="w-4 h-4 text-emerald-500" />
            <span>Unlimited Practice Quizzes</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="check" className="w-4 h-4 text-emerald-500" />
            <span>Personalized AI Study Schedule Generator</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="check" className="w-4 h-4 text-emerald-500" />
            <span>Audio Explanations & Diagram Downloads</span>
          </div>
        </div>

        <div className="text-2xl font-extrabold text-slate-900">
          $9.99 <span className="text-xs text-slate-400 font-semibold">/ month</span>
        </div>

        <button 
          onClick={() => {
            showToast('Upgraded to Pro successfully!');
            onClose();
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// AUTH VIEWS (With Show Password Visibility Toggle Options)
// ----------------------------------------------------------------------

// 1. Auth Landing
function AuthLanding({ onNavigate }) {
  return (
    <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[600px] fade-in">
      <div className="p-8 sm:p-12 flex flex-col justify-between space-y-8 bg-gradient-to-b from-slate-50/50 to-white">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Icon name="graduation-cap" className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              StudyMate <span className="text-indigo-600">AI</span>
            </span>
          </div>

          <div className="space-y-3 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Welcome to
            </h2>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              StudyMate <span className="text-indigo-600">AI</span>
            </h1>
            <p className="text-base font-bold text-indigo-600 pt-1">
              Your Smart Learning Companion
            </p>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md pt-2">
              Get instant help, personalized study plans, quizzes and more. Learn smarter, not harder.
            </p>
          </div>

          <div className="space-y-3 max-w-xs">
            <button 
              onClick={() => onNavigate('auth-login')}
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
            >
              <Icon name="user" className="w-4 h-4" />
              <span>Login</span>
            </button>
            <button 
              onClick={() => onNavigate('auth-signup')}
              className="w-full py-3.5 px-6 rounded-2xl border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Icon name="user-plus" className="w-4 h-4" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 pt-4 border-t border-slate-100">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Icon name="book-open" className="w-4 h-4" />
          </div>
          <span>Empowering students, building futures.</span>
        </div>
      </div>

      <div className="bg-gradient-to-tr from-indigo-100 via-indigo-50 to-purple-100 p-8 flex items-center justify-center relative overflow-hidden hidden md:flex">
        <div className="absolute top-8 right-8 w-20 h-20 rounded-full bg-white/80 backdrop-blur-md p-2 shadow-lg animate-float">
          <img 
            src="assets/robot_avatar.png" 
            alt="AI Bot" 
            className="w-full h-full object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        <div className="max-w-sm w-full h-auto flex justify-center">
          <img 
            src="assets/hero_student.png" 
            alt="3D Student Mascot" 
            className="w-full object-contain max-h-[480px] drop-shadow-xl"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      </div>
    </div>
  );
}

// 2. Auth Login View (With Show Password Eye Toggle)
function AuthLogin({ accounts, onLoginSuccess, onNavigate, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [noAccountError, setNoAccountError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setNoAccountError(false);

    const cleanEmail = email.trim().toLowerCase();
    const existingAcc = accounts.find((a) => a.email.trim().toLowerCase() === cleanEmail);

    if (!existingAcc) {
      setNoAccountError(true);
      setErrorMsg('No account found with this email address.');
      return;
    }

    if (existingAcc.password !== password) {
      setErrorMsg('Incorrect password. Please verify and try again.');
      return;
    }

    onLoginSuccess(existingAcc);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-8 space-y-6 fade-in">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
          <Icon name="graduation-cap" className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Sign In to StudyMate AI</h2>
        <p className="text-xs text-slate-500">Welcome back! Please enter your account credentials.</p>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-800 space-y-2 fade-in">
          <div className="flex items-center gap-2 font-bold text-rose-900">
            <Icon name="alert-circle" className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          {noAccountError && (
            <div className="pt-1">
              <button 
                type="button" 
                onClick={() => onNavigate('auth-signup')}
                className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors flex items-center justify-center gap-1"
              >
                <span>Create an Account Now</span>
                <Icon name="arrow-right" className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
            placeholder="student@university.edu"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-11 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              <Icon name={showPassword ? "eye-off" : "eye"} className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600">
            <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
            <span>Remember Me</span>
          </label>
          <button 
            type="button" 
            onClick={() => onNavigate('auth-forgot-password')}
            className="text-indigo-600 hover:text-indigo-700 font-bold"
          >
            Forgot Password?
          </button>
        </div>

        <button 
          type="submit"
          className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all"
        >
          Sign In
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
        Don't have an account?{' '}
        <button 
          onClick={() => onNavigate('auth-signup')} 
          className="font-bold text-indigo-600 hover:text-indigo-700"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

// 3. Auth Sign Up View (With Show Password & Show Repeat Password Eye Toggles)
function AuthSignUp({ accounts, onSignUpSuccess, onNavigate, showToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (password !== repeatPassword) {
      setErrorMsg('Passwords do not match. Please re-type password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = accounts.find((a) => a.email.trim().toLowerCase() === cleanEmail);
    if (existing) {
      setErrorMsg('An account with this email already exists. Please log in.');
      return;
    }

    const newAcc = {
      name: name.trim(),
      email: cleanEmail,
      password: password,
      grade: 'Undergraduate'
    };

    onSignUpSuccess(newAcc);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-8 space-y-6 fade-in">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
          <Icon name="user-plus" className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Create Account</h2>
        <p className="text-xs text-slate-500">Register your account to access StudyMate AI.</p>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2 fade-in">
          <Icon name="alert-circle" className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
          <input 
            type="text" 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Student Email</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@university.edu"
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-600"
          />
        </div>

        {/* Password Input with Show/Hide Eye Button */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 pr-11 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-600"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              <Icon name={showPassword ? "eye-off" : "eye"} className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Repeat Password Input with Show/Hide Eye Button */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Repeat Password (Confirmation)</label>
          <div className="relative">
            <input 
              type={showRepeatPassword ? "text" : "password"} 
              required 
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 pr-11 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-600"
            />
            <button 
              type="button"
              onClick={() => setShowRepeatPassword(!showRepeatPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
              title={showRepeatPassword ? "Hide password" : "Show password"}
            >
              <Icon name={showRepeatPassword ? "eye-off" : "eye"} className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
          <input type="checkbox" required className="rounded text-indigo-600 focus:ring-indigo-500" />
          <span>I agree to Terms & Conditions</span>
        </div>

        <button 
          type="submit"
          className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all"
        >
          Create Account
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
        Already have an account?{' '}
        <button 
          onClick={() => onNavigate('auth-login')} 
          className="font-bold text-indigo-600 hover:text-indigo-700"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

// 4. Auth Forgot Password View
function AuthForgotPassword({ accounts, onNavigate, showToast }) {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const existing = accounts.find((a) => a.email.trim().toLowerCase() === cleanEmail);
    
    if (!existing) {
      setErrorMsg('No registered account found with this email address.');
      return;
    }

    setSent(true);
    showToast('Recovery link sent!');
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-8 space-y-6 fade-in">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
          <Icon name="key-round" className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Reset Password</h2>
        <p className="text-xs text-slate-500">Enter your registered email to receive a recovery link.</p>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2 fade-in">
          <Icon name="alert-circle" className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {sent ? (
        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 text-center space-y-3 fade-in">
          <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">
            ✓
          </div>
          <h4 className="font-bold text-sm text-emerald-950">Check your email</h4>
          <p className="text-xs text-emerald-800 leading-relaxed font-medium">
            We have sent a password reset link to <strong>{email}</strong>.
          </p>
          <button 
            onClick={() => onNavigate('auth-login')}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
          >
            Return to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-600"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all"
          >
            Send Recovery Link
          </button>
        </form>
      )}

      <div className="text-center text-xs font-bold">
        <button 
          onClick={() => onNavigate('auth-login')} 
          className="text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto"
        >
          <Icon name="arrow-left" className="w-4 h-4" />
          <span>Back to Login</span>
        </button>
      </div>
    </div>
  );
}

// Render App into DOM
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
