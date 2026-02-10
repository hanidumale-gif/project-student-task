// script.js - Complete JavaScript for Student Task Tracker with JSON Server API

// API Configuration
const API_BASE_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initializeNavigation();
    initializeLoginSystem();
    initializeTaskManager();
    initializeFAQ();
    initializeContactForm();
    initializePricingCards();
    
    // Initialize theme toggle
    initializeThemeToggle();
});

// ============ API FUNCTIONS ============

// User API Functions
async function loginUserAPI(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/users?email=${email}&password=${password}`);
        const users = await response.json();
        
        if (users.length > 0) {
            const user = users[0];
            // Remove password before storing
            const { password: _, ...userWithoutPassword } = user;
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
            localStorage.setItem('isLoggedIn', 'true');
            return userWithoutPassword;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Login API error:', error);
        return null;
    }
}

async function createUserAPI(userData) {
    try {
        // Check if user already exists
        const checkResponse = await fetch(`${API_BASE_URL}/users?email=${userData.email}`);
        const existingUsers = await checkResponse.json();
        
        if (existingUsers.length > 0) {
            throw new Error('User with this email already exists');
        }
        
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create user');
        }
        
        const newUser = await response.json();
        // Remove password before storing
        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    } catch (error) {
        console.error('Create user API error:', error);
        throw error;
    }
}

// Task API Functions
async function fetchTasksAPI(userId = null) {
    try {
        let url = `${API_BASE_URL}/tasks`;
        if (userId) {
            url += `?userId=${userId}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        
        const tasks = await response.json();
        return tasks;
    } catch (error) {
        console.error('Fetch tasks API error:', error);
        return [];
    }
}

async function createTaskAPI(taskData) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) throw new Error('Failed to create task');
        
        const newTask = await response.json();
        return newTask;
    } catch (error) {
        console.error('Create task API error:', error);
        throw error;
    }
}

async function updateTaskAPI(taskId, taskData) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) throw new Error('Failed to update task');
        
        const updatedTask = await response.json();
        return updatedTask;
    } catch (error) {
        console.error('Update task API error:', error);
        throw error;
    }
}

async function deleteTaskAPI(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete task');
        
        return true;
    } catch (error) {
        console.error('Delete task API error:', error);
        throw error;
    }
}

// Features API Functions
async function fetchFeaturesAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/features`);
        if (!response.ok) throw new Error('Failed to fetch features');
        
        const features = await response.json();
        return features;
    } catch (error) {
        console.error('Fetch features API error:', error);
        return [];
    }
}

// Team API Functions
async function fetchTeamAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/team`);
        if (!response.ok) throw new Error('Failed to fetch team');
        
        const team = await response.json();
        return team;
    } catch (error) {
        console.error('Fetch team API error:', error);
        return [];
    }
}

// ============ APPLICATION FUNCTIONS ============

// 1. Navigation and Mobile Menu
function initializeNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
    
    // Update active navigation link based on current page
    updateActiveNavLink();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
}

function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        link.classList.remove('active');
        
        if (currentPage === linkPage || 
            (currentPage === '' && linkPage === 'home.html') ||
            (currentPage.includes('index') && linkPage === 'home.html')) {
            link.classList.add('active');
        }
    });
}

function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// 2. Login System
function initializeLoginSystem() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const closeModals = document.querySelectorAll('.close-modal');
    const signupLink = document.getElementById('signupLink');
    const loginLink = document.getElementById('loginLink');
    
    // Check if user is already logged in
    checkLoginStatus();
    
    // Login button click
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (loginBtn.classList.contains('logged-in')) {
                // User is logged in - show logout option
                if (confirm('Are you sure you want to logout?')) {
                    logoutUser();
                }
            } else {
                // User is not logged in - show login modal
                openModal(loginModal);
            }
        });
    }
    
    // Close modals
    closeModals.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (loginModal && e.target === loginModal) {
            closeModal(loginModal);
        }
        if (signupModal && e.target === signupModal) {
            closeModal(signupModal);
        }
    });
    
    // Switch between login and signup modals
    if (signupLink) {
        signupLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(loginModal);
            openModal(signupModal);
        });
    }
    
    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(signupModal);
            openModal(loginModal);
        });
    }
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (!validateLoginForm(email, password)) return;
            
            showNotification('Logging in...', 'info');
            
            try {
                const user = await loginUserAPI(email, password);
                if (user) {
                    updateLoginUI(user);
                    closeModal(loginModal);
                    loginForm.reset();
                    showNotification(`Welcome back, ${user.firstName}!`, 'success');
                    
                    // Redirect to home page if not already there
                    if (!window.location.href.includes('home.html') && !window.location.href.includes('index')) {
                        setTimeout(() => {
                            window.location.href = 'home.html';
                        }, 1500);
                    }
                } else {
                    showNotification('Invalid email or password', 'error');
                }
            } catch (error) {
                showNotification('Login failed. Please try again.', 'error');
                console.error('Login error:', error);
            }
        });
    }
    
    // Signup form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const firstName = document.getElementById('signupFirstName').value;
            const lastName = document.getElementById('signupLastName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const university = document.getElementById('university').value;
            const major = document.getElementById('major').value;
            
            if (!validateSignupForm(firstName, lastName, email, password, confirmPassword, university)) {
                return;
            }
            
            showNotification('Creating account...', 'info');
            
            try {
                const userData = {
                    firstName,
                    lastName,
                    email,
                    password,
                    university,
                    major: major || 'Undeclared',
                    username: email.split('@')[0],
                    joinDate: new Date().toISOString()
                };
                
                const user = await createUserAPI(userData);
                updateLoginUI(user);
                closeModal(signupModal);
                signupForm.reset();
                
                showNotification(`Account created successfully! Welcome, ${firstName}!`, 'success');
                
                // Redirect to home page
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1500);
            } catch (error) {
                if (error.message.includes('already exists')) {
                    showNotification('User with this email already exists', 'error');
                } else {
                    showNotification('Failed to create account. Please try again.', 'error');
                }
                console.error('Signup error:', error);
            }
        });
    }
    
    // Forgot password
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            const email = prompt('Enter your email to reset password:');
            if (email && isValidEmail(email)) {
                showNotification(`Password reset link sent to ${email}`, 'info');
            } else if (email) {
                showNotification('Please enter a valid email address', 'error');
            }
        });
    }
}

function checkLoginStatus() {
    const loginBtn = document.getElementById('loginBtn');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    if (user && loginBtn) {
        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${user.firstName || 'User'}`;
        loginBtn.classList.add('logged-in');
    }
}

function validateLoginForm(email, password) {
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return false;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return false;
    }
    
    return true;
}

function validateSignupForm(firstName, lastName, email, password, confirmPassword, university) {
    if (!firstName || !lastName || !email || !password || !confirmPassword || !university) {
        showNotification('Please fill in all required fields', 'error');
        return false;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return false;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return false;
    }
    
    return true;
}

function updateLoginUI(user) {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn && user) {
        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${user.firstName}`;
        loginBtn.classList.add('logged-in');
    }
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        loginBtn.classList.remove('logged-in');
    }
    
    showNotification('Logged out successfully', 'info');
    
    // If on home page, reload tasks (show empty state)
    if (window.location.href.includes('home.html') || window.location.href.includes('index')) {
        if (window.taskManager) {
            window.taskManager.renderTasks();
            window.taskManager.updateProgress();
        }
    }
}

// 3. Task Manager (for home page only)
function initializeTaskManager() {
    if (!document.getElementById('taskForm')) return;
    
    window.taskManager = {
        tasks: [],
        editingTaskId: null,
        
        async init() {
            await this.loadTasks();
            this.setupEventListeners();
            this.renderTasks();
            this.updateProgress();
        },
        
        async loadTasks() {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (user) {
                this.tasks = await fetchTasksAPI(user.id);
            } else {
                this.tasks = await fetchTasksAPI();
            }
            
            // If no tasks, create sample ones
            if (this.tasks.length === 0) {
                this.tasks = await this.createSampleTasks();
            }
        },
        
        async createSampleTasks() {
            const sampleTasks = [
                {
                    title: 'Complete Math Assignment',
                    description: 'Finish calculus problems 1-20 from chapter 5',
                    priority: 'high',
                    deadline: getTomorrowDate(),
                    category: 'academic',
                    completed: true,
                    createdAt: new Date().toISOString()
                },
                {
                    title: 'Study for Physics Exam',
                    description: 'Review chapters 1-3 on thermodynamics',
                    priority: 'high',
                    deadline: getDateInDays(3),
                    category: 'academic',
                    completed: false,
                    createdAt: new Date().toISOString()
                },
                {
                    title: 'Submit Research Paper',
                    description: 'Finalize and submit literature review paper',
                    priority: 'medium',
                    deadline: getDateInDays(7),
                    category: 'academic',
                    completed: false,
                    createdAt: new Date().toISOString()
                }
            ];
            
            // Create sample tasks in API
            const createdTasks = [];
            for (const task of sampleTasks) {
                try {
                    const newTask = await createTaskAPI(task);
                    createdTasks.push(newTask);
                } catch (error) {
                    console.error('Error creating sample task:', error);
                }
            }
            
            return createdTasks;
        },
        
        setupEventListeners() {
            // Task form submission
            const taskForm = document.getElementById('taskForm');
            if (taskForm) {
                taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
            }
            
            // Task filter
            const taskFilter = document.getElementById('taskFilter');
            if (taskFilter) {
                taskFilter.addEventListener('change', () => this.renderTasks());
            }
            
            // Task search
            const taskSearch = document.getElementById('taskSearch');
            if (taskSearch) {
                taskSearch.addEventListener('input', () => this.renderTasks());
            }
            
            // Set minimum date for deadline input
            const deadlineInput = document.getElementById('taskDeadline');
            if (deadlineInput) {
                const today = new Date().toISOString().split('T')[0];
                deadlineInput.min = today;
            }
        },
        
        async handleTaskSubmit(e) {
            e.preventDefault();
            
            // Check if user is logged in
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (!user) {
                showNotification('Please login to add tasks', 'error');
                openModal(document.getElementById('loginModal'));
                return;
            }
            
            const title = document.getElementById('taskTitle').value.trim();
            const description = document.getElementById('taskDescription').value.trim();
            const priority = document.getElementById('taskPriority').value;
            const deadline = document.getElementById('taskDeadline').value;
            const category = document.getElementById('taskCategory').value;
            
            if (!title) {
                showNotification('Please enter a task title', 'error');
                return;
            }
            
            const taskData = {
                title: title,
                description: description,
                priority: priority,
                deadline: deadline,
                category: category,
                completed: false,
                createdAt: new Date().toISOString(),
                userId: user.id
            };
            
            try {
                if (this.editingTaskId) {
                    // Update existing task
                    const updatedTask = await updateTaskAPI(this.editingTaskId, taskData);
                    const taskIndex = this.tasks.findIndex(t => t.id === this.editingTaskId);
                    if (taskIndex !== -1) {
                        this.tasks[taskIndex] = updatedTask;
                    }
                    this.editingTaskId = null;
                    document.querySelector('#taskForm button[type="submit"]').innerHTML = '<i class="fas fa-plus"></i> Add Task';
                    showNotification('Task updated successfully!', 'success');
                } else {
                    // Add new task
                    const newTask = await createTaskAPI(taskData);
                    this.tasks.push(newTask);
                    showNotification('Task added successfully!', 'success');
                }
                
                this.renderTasks();
                this.updateProgress();
                
                // Reset form
                document.getElementById('taskForm').reset();
                document.getElementById('taskPriority').value = 'medium';
                document.getElementById('taskCategory').value = 'academic';
                
            } catch (error) {
                showNotification('Failed to save task. Please try again.', 'error');
                console.error('Task save error:', error);
            }
        },
        
        renderTasks() {
            const container = document.getElementById('tasksContainer');
            if (!container) return;
            
            const filter = document.getElementById('taskFilter')?.value || 'all';
            const search = document.getElementById('taskSearch')?.value.toLowerCase() || '';
            
            let filteredTasks = this.tasks.filter(task => {
                const matchesSearch = task.title.toLowerCase().includes(search) || 
                                     (task.description && task.description.toLowerCase().includes(search));
                const matchesFilter = filter === 'all' || 
                                     (filter === 'completed' && task.completed) ||
                                     (filter === 'pending' && !task.completed);
                return matchesSearch && matchesFilter;
            });
            
            // Sort by deadline (soonest first), then by priority
            filteredTasks.sort((a, b) => {
                // First by deadline
                if (!a.deadline && !b.deadline) return 0;
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                
                const deadlineCompare = new Date(a.deadline) - new Date(b.deadline);
                if (deadlineCompare !== 0) return deadlineCompare;
                
                // Then by priority (high > medium > low)
                const priorityOrder = { high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
            
            if (filteredTasks.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <h4>No tasks found</h4>
                        <p>${this.tasks.length === 0 ? 'Add your first task to get started!' : 'Try changing your search or filter'}</p>
                    </div>
                `;
            } else {
                container.innerHTML = filteredTasks.map(task => `
                    <div class="task-card ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                        <div class="task-header">
                            <div class="task-title">${escapeHtml(task.title)}</div>
                            <div class="task-priority ${task.priority}">${task.priority}</div>
                        </div>
                        <div class="task-description">${escapeHtml(task.description || 'No description')}</div>
                        <div class="task-footer">
                            <div>
                                <div class="task-category">
                                    <i class="fas fa-tag"></i> ${task.category}
                                </div>
                                ${task.deadline ? `
                                    <div class="task-deadline">
                                        <i class="fas fa-calendar-day"></i> ${formatDate(task.deadline)}
                                    </div>
                                ` : ''}
                            </div>
                            <div class="task-actions">
                                <button class="complete-btn" title="${task.completed ? 'Mark as pending' : 'Mark as complete'}">
                                    <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                                </button>
                                <button class="edit-btn" title="Edit task">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="delete-btn" title="Delete task">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
                
                // Add event listeners to task buttons
                container.querySelectorAll('.complete-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const taskId = e.target.closest('.task-card').dataset.id;
                        this.toggleTaskComplete(taskId);
                    });
                });
                
                container.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const taskId = e.target.closest('.task-card').dataset.id;
                        this.editTask(taskId);
                    });
                });
                
                container.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const taskId = e.target.closest('.task-card').dataset.id;
                        this.deleteTask(taskId);
                    });
                });
            }
        },
        
        async toggleTaskComplete(taskId) {
            const taskIndex = this.tasks.findIndex(t => t.id == taskId);
            if (taskIndex === -1) return;
            
            const task = this.tasks[taskIndex];
            const updatedTask = {
                ...task,
                completed: !task.completed
            };
            
            try {
                const savedTask = await updateTaskAPI(taskId, updatedTask);
                this.tasks[taskIndex] = savedTask;
                this.renderTasks();
                this.updateProgress();
                
                const action = savedTask.completed ? 'completed' : 'marked as pending';
                showNotification(`Task "${savedTask.title}" ${action}`, 'success');
            } catch (error) {
                showNotification('Failed to update task', 'error');
                console.error('Toggle complete error:', error);
            }
        },
        
        editTask(taskId) {
            const task = this.tasks.find(t => t.id == taskId);
            if (task) {
                document.getElementById('taskTitle').value = task.title;
                document.getElementById('taskDescription').value = task.description;
                document.getElementById('taskPriority').value = task.priority;
                document.getElementById('taskDeadline').value = task.deadline;
                document.getElementById('taskCategory').value = task.category;
                
                this.editingTaskId = taskId;
                const submitBtn = document.querySelector('#taskForm button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Task';
                
                // Scroll to form
                document.getElementById('taskForm').scrollIntoView({ behavior: 'smooth' });
                
                showNotification('Editing task: ' + task.title, 'info');
            }
        },
        
        async deleteTask(taskId) {
            if (!confirm('Are you sure you want to delete this task?')) return;
            
            try {
                await deleteTaskAPI(taskId);
                this.tasks = this.tasks.filter(t => t.id != taskId);
                this.renderTasks();
                this.updateProgress();
                showNotification('Task deleted', 'info');
            } catch (error) {
                showNotification('Failed to delete task', 'error');
                console.error('Delete task error:', error);
            }
        },
        
        updateProgress() {
            const totalTasks = this.tasks.length;
            const completedTasks = this.tasks.filter(t => t.completed).length;
            const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            // Update progress bar
            const progressFill = document.getElementById('progressFill');
            if (progressFill) {
                progressFill.style.width = `${progressPercentage}%`;
            }
            
            // Update progress text
            const progressText = document.getElementById('progressText');
            if (progressText) {
                progressText.textContent = `${progressPercentage}% Complete`;
            }
            
            // Update stats
            const totalTasksEl = document.getElementById('totalTasks');
            const completedTasksEl = document.getElementById('completedTasks');
            const pendingTasksEl = document.getElementById('pendingTasks');
            
            if (totalTasksEl) totalTasksEl.textContent = totalTasks;
            if (completedTasksEl) completedTasksEl.textContent = completedTasks;
            if (pendingTasksEl) pendingTasksEl.textContent = totalTasks - completedTasks;
        }
    };
    
    // Initialize task manager
    window.taskManager.init();
}

// 4. FAQ System
function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isActive = answer.classList.contains('active');
            
            // Close all other FAQ answers
            document.querySelectorAll('.faq-answer').forEach(ans => {
                ans.classList.remove('active');
                ans.style.maxHeight = null;
            });
            
            // Reset all icons
            document.querySelectorAll('.faq-question i').forEach(icon => {
                icon.style.transform = 'rotate(0deg)';
            });
            
            if (!isActive) {
                answer.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                const icon = question.querySelector('i');
                if (icon) {
                    icon.style.transform = 'rotate(180deg)';
                }
            }
        });
    });
}

// 5. Contact Form
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const category = document.getElementById('category').value;
        const message = document.getElementById('message').value;
        
        if (!name || !email || !subject || !category || !message) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate API call to save contact message
        showNotification('Sending message...', 'info');
        
        // In a real app, you would send this to your API
        setTimeout(() => {
            // Show success modal
            const successModal = document.getElementById('contactSuccessModal');
            if (successModal) {
                successModal.style.display = 'flex';
            }
            
            // Reset form
            contactForm.reset();
            
            showNotification('Message sent successfully! We\'ll respond within 24 hours.', 'success');
        }, 1500);
    });
    
    // Close success modal
    const closeSuccessBtn = document.querySelector('.close-success');
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => {
            const successModal = document.getElementById('contactSuccessModal');
            if (successModal) {
                successModal.style.display = 'none';
            }
        });
    }
}

// 6. Pricing Cards
function initializePricingCards() {
    const pricingButtons = document.querySelectorAll('.pricing-card button');
    
    pricingButtons.forEach(button => {
        button.addEventListener('click', function() {
            const plan = this.closest('.pricing-card').querySelector('h3').textContent;
            
            // Check if user is logged in
            if (!localStorage.getItem('isLoggedIn')) {
                showNotification('Please login to select a plan', 'error');
                openModal(document.getElementById('loginModal'));
                return;
            }
            
            if (plan === 'Free') {
                showNotification('Free plan selected! You can start using basic features immediately.', 'success');
            } else {
                showNotification(`Thank you for choosing ${plan} plan! You'll be redirected to payment.`, 'success');
                // In a real app, you would redirect to payment gateway here
                setTimeout(() => {
                    alert(`Payment integration for ${plan} plan would appear here.`);
                }, 1000);
            }
        });
    });
}

// 7. Theme Toggle
function initializeThemeToggle() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    
    // Create theme toggle button if not exists
    if (!document.querySelector('.theme-toggle')) {
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle login-btn';
        themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        themeToggle.title = 'Toggle Theme';
        
        // Insert after login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn && loginBtn.parentNode) {
            loginBtn.parentNode.insertBefore(themeToggle, loginBtn.nextSibling);
        }
        
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

// ============ UTILITY FUNCTIONS ============

function openModal(modal) {
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset forms in modal
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => form.reset());
    }
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'No deadline';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
}

function getDateInDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-notification">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Add notification styles if not already present
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            z-index: 1003;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
        }
        
        .notification.success {
            background-color: #4CAF50;
        }
        
        .notification.error {
            background-color: #f44336;
        }
        
        .notification.info {
            background-color: #2196F3;
        }
        
        .close-notification {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            margin-left: 10px;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
        }
        
        .close-notification:hover {
            background-color: rgba(255,255,255,0.2);
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;

            }
        }
    `;
    document.head.appendChild(style);
}