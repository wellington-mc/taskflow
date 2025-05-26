/**
 * App.js
 * 
 * Arquivo principal que inicializa o aplicativo TaskFlow
 * e coordena os diferentes módulos
 */

// Constantes para identificação das páginas
const PAGES = {
    DASHBOARD: 'dashboard',
    ALL_TASKS: 'all-tasks',
    CALENDAR: 'calendar',
    STATISTICS: 'statistics',
    SETTINGS: 'settings'
};

// Página atual
let currentPage = PAGES.DASHBOARD;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar o gerenciador de tarefas
    TaskManager.init();
    
    // Inicializar os gráficos
    ChartManager.init();
    
    // Inicializar o sistema de notificações
    NotificationManager.init();
    
    // Configurar tema escuro
    setupThemeToggle();
    
    // Configurar menu para dispositivos móveis
    setupMobileMenu();
    
    // Configurar navegação
    setupNavigation();
    
    // Inicializar os módulos de visualização
    initializeViewModules();
    
    // Configurar integração de notificações com tarefas
    setupNotificationsIntegration();
});

/**
 * Configura o botão de alternância entre tema claro e escuro
 */
function setupThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');
    
    // Verificar se o tema escuro está salvo
    const isDarkTheme = localStorage.getItem('taskflow_dark_theme') === 'true';
    
    // Aplicar tema salvo
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
    
    // Alternar tema ao clicar no botão
    themeToggleBtn.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        
        // Atualizar ícone
        if (document.body.classList.contains('dark-theme')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('taskflow_dark_theme', 'true');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('taskflow_dark_theme', 'false');
        }
    });
}

/**
 * Configura o menu para dispositivos móveis
 */
function setupMobileMenu() {
    // Adicionar botão de menu para dispositivos móveis
    const mainHeader = document.querySelector('.main-header');
    const menuToggleBtn = document.createElement('button');
    menuToggleBtn.className = 'menu-toggle';
    menuToggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mainHeader.prepend(menuToggleBtn);
    
    // Adicionar overlay para quando o menu estiver aberto
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    
    // Alternar menu ao clicar no botão
    menuToggleBtn.addEventListener('click', function() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });
    
    // Fechar menu ao clicar no overlay
    overlay.addEventListener('click', function() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Fechar menu ao clicar em um item do menu
    const menuItems = document.querySelectorAll('.sidebar-nav a');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    });
}

/**
 * Configura a navegação entre as páginas
 */
function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover classe 'active' de todos os links
            navLinks.forEach(navLink => {
                navLink.parentElement.classList.remove('active');
            });
            
            // Adicionar classe 'active' ao link clicado
            this.parentElement.classList.add('active');
            
            // Obter a página a ser navegada do atributo data-page
            const targetPage = this.getAttribute('data-page');
            if (targetPage) {
                navigateToPage(targetPage);
            }
        });
    });
}

/**
 * Inicializa os módulos de visualização para as diferentes páginas
 */
function initializeViewModules() {
    // Criar objetos para as diferentes visualizações
    window.CalendarView = {
        // Estado do calendário
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        selectedDate: null,
        dayTasksPanel: null,
        selectedDateEl: null,
        dayTasksList: null,
        emptyDayTasks: null,
        addTaskCalendarBtn: null,
        closeDayPanelBtn: null,
        
        /**
         * Inicializa a visualização do calendário
         */
        init: function() {
            console.log('Inicializando visualização de calendário');
            
            // Obter elementos da interface
            this.dayTasksPanel = document.getElementById('day-tasks-panel');
            this.selectedDateEl = document.getElementById('selected-date');
            this.dayTasksList = document.getElementById('day-tasks-list');
            this.emptyDayTasks = document.getElementById('empty-day-tasks');
            this.addTaskCalendarBtn = document.getElementById('add-task-calendar');
            this.closeDayPanelBtn = document.getElementById('close-day-panel');
            this.prevMonthBtn = document.getElementById('prev-month');
            this.nextMonthBtn = document.getElementById('next-month');
            
            // Configurar eventos dos botões de navegação
            if (this.prevMonthBtn) {
                this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
            }
            
            if (this.nextMonthBtn) {
                this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
            }
            
            // Configurar eventos do painel de tarefas do dia
            if (this.closeDayPanelBtn) {
                this.closeDayPanelBtn.addEventListener('click', () => this.closeDayPanel());
            }
            
            if (this.addTaskCalendarBtn) {
                this.addTaskCalendarBtn.addEventListener('click', () => this.addTaskForSelectedDate());
            }
            
            // Renderizar o calendário
            this.renderCalendar();
        },
        
        /**
         * Muda o mês exibido no calendário
         * @param {Number} delta - 1 para avançar, -1 para retroceder
         */
        changeMonth: function(delta) {
            // Atualizar mês
            this.currentMonth += delta;
            
            // Ajustar ano se necessário
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            } else if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            
            // Renderizar novo mês
            this.renderCalendar();
            
            // Fechar painel de tarefas do dia
            this.closeDayPanel();
        },
        
        /**
         * Renderiza o calendário para o mês atual
         */
        renderCalendar: function() {
            const calendarEl = document.getElementById('calendar-days');
            if (!calendarEl) return;
            
            // Limpar calendário
            calendarEl.innerHTML = '';
            
            // Atualizar título do mês
            const monthTitle = document.getElementById('current-month');
            if (monthTitle) {
                monthTitle.textContent = new Date(this.currentYear, this.currentMonth)
                    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            }
            
            // Primeiro dia do mês
            const firstDay = new Date(this.currentYear, this.currentMonth, 1);
            // Último dia do mês
            const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
            
            // Dia da semana do primeiro dia (0 = Domingo, 6 = Sábado)
            const firstDayIndex = firstDay.getDay();
            // Total de dias no mês
            const totalDays = lastDay.getDate();
            
            // Dias do mês anterior para preencher o início do calendário
            const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
            
            // Obter todas as tarefas
            const tasks = TaskStorage.getTasks();
            
            // Dias totais no grid (42 = 6 semanas * 7 dias)
            const totalCells = 42;
            
            // Criar células do calendário
            for (let i = 0; i < totalCells; i++) {
                const dayCell = document.createElement('div');
                dayCell.classList.add('calendar-day');
                
                let dateStr = '';
                
                // Dias do mês anterior
                if (i < firstDayIndex) {
                    const prevMonthDay = prevMonthLastDay - firstDayIndex + i + 1;
                    dayCell.textContent = prevMonthDay;
                    dayCell.classList.add('other-month');
                    
                    // Calcular mês anterior
                    const prevMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
                    const prevYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
                    dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(prevMonthDay).padStart(2, '0')}`;
                }
                // Dias do mês atual
                else if (i < firstDayIndex + totalDays) {
                    const day = i - firstDayIndex + 1;
                    dayCell.textContent = day;
                    
                    // Verificar se é hoje
                    const today = new Date();
                    if (day === today.getDate() && 
                        this.currentMonth === today.getMonth() && 
                        this.currentYear === today.getFullYear()) {
                        dayCell.classList.add('today');
                    }
                    
                    // Formatar data para comparação
                    dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                }
                // Dias do próximo mês
                else {
                    const nextMonthDay = i - (firstDayIndex + totalDays) + 1;
                    dayCell.textContent = nextMonthDay;
                    dayCell.classList.add('other-month');
                    
                    // Calcular próximo mês
                    const nextMonth = this.currentMonth === 11 ? 0 : this.currentMonth + 1;
                    const nextYear = this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear;
                    dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(nextMonthDay).padStart(2, '0')}`;
                }
                
                // Armazenar a data na célula
                dayCell.dataset.date = dateStr;
                
                // Verificar se há tarefas para este dia
                const dayTasks = tasks.filter(task => task.dueDate === dateStr);
                if (dayTasks.length > 0) {
                    dayCell.classList.add('has-tasks');
                    
                    // Adicionar contador de tarefas
                    if (dayTasks.length > 1) {
                        const taskCount = document.createElement('span');
                        taskCount.className = 'task-count';
                        taskCount.textContent = dayTasks.length;
                        dayCell.appendChild(taskCount);
                    }
                }
                
                // Adicionar evento de clique para mostrar tarefas do dia
                dayCell.addEventListener('click', () => {
                    this.showDayTasks(dateStr);
                });
                
                calendarEl.appendChild(dayCell);
            }
        },
        
        /**
         * Mostra as tarefas de um dia específico
         * @param {String} dateStr - Data no formato YYYY-MM-DD
         */
        showDayTasks: function(dateStr) {
            // Armazenar a data selecionada
            this.selectedDate = dateStr;
            
            // Verificar se os elementos necessários existem
            if (!this.dayTasksPanel || !this.selectedDateEl || !this.dayTasksList) {
                console.error('Elementos do painel de tarefas não encontrados');
                return;
            }
            
            // Log para debug
            console.log('Data selecionada:', dateStr);
            
            // Atualizar título com a data selecionada - Corrigido para garantir o timezone correto
            // Formato da data é YYYY-MM-DD, precisamos adicionar o timezone para evitar problemas
            const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
            const date = new Date(year, month - 1, day); // Mês em JavaScript é 0-indexed
            this.selectedDateEl.textContent = `Tarefas para ${date.toLocaleDateString('pt-BR')}`;
            
            // Buscar tarefas para a data selecionada
            const tasks = TaskStorage.getTasks().filter(task => task.dueDate === dateStr);
            
            // Limpar lista
            this.dayTasksList.innerHTML = '';
            
            // Mostrar mensagem se não houver tarefas ou a lista de tarefas
            if (tasks.length === 0) {
                if (this.emptyDayTasks) {
                    this.emptyDayTasks.classList.remove('hidden');
                }
            } else {
                if (this.emptyDayTasks) {
                    this.emptyDayTasks.classList.add('hidden');
                }
                
                // Renderizar cada tarefa
                tasks.forEach(task => {
                    const taskItem = document.createElement('li');
                    taskItem.className = 'day-task-item';
                    taskItem.dataset.id = task.id;
                    
                    // Ícone de status
                    let statusIcon = '';
                    if (task.status === 'concluida') {
                        statusIcon = '<i class="fas fa-check-circle" style="color: var(--success-color);"></i>';
                    } else if (task.status === 'em-progresso') {
                        statusIcon = '<i class="fas fa-spinner" style="color: var(--info-color);"></i>';
                    } else {
                        statusIcon = '<i class="fas fa-circle" style="color: var(--warning-color);"></i>';
                    }
                    
                    // Prioridade
                    let priorityClass = '';
                    if (task.priority === 'alta') {
                        priorityClass = 'high-priority';
                    } else if (task.priority === 'media') {
                        priorityClass = 'medium-priority';
                    } else {
                        priorityClass = 'low-priority';
                    }
                    
                    taskItem.innerHTML = `
                        <div class="task-info ${priorityClass}">
                            ${statusIcon}
                            <span class="task-title">${task.title}</span>
                            <span class="category-badge ${task.category}">
                                ${TaskManager.getCategoryLabel(task.category)}
                            </span>
                        </div>
                        <div class="day-task-actions">
                            <button class="action-button edit" title="Editar" onclick="TaskManager.editTask('${task.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-button status" title="Mudar Status" onclick="CalendarView.toggleTaskStatus('${task.id}')">
                                <i class="fas fa-check"></i>
                            </button>
                        </div>
                    `;
                    
                    this.dayTasksList.appendChild(taskItem);
                });
            }
            
            // Mostrar o painel
            this.dayTasksPanel.classList.remove('hidden');
        },
        
        /**
         * Alterna o status de uma tarefa entre pendente e concluída
         * @param {String} taskId - ID da tarefa
         */
        toggleTaskStatus: function(taskId) {
            // Buscar a tarefa
            const task = TaskStorage.getTaskById(taskId);
            if (!task) return;
            
            // Alternar status
            if (task.status === 'concluida') {
                task.status = 'pendente';
            } else {
                task.status = 'concluida';
                task.completedAt = new Date().toISOString();
            }
            
            // Salvar alterações
            TaskStorage.saveTask(task);
            
            // Atualizar visualização
            this.showDayTasks(this.selectedDate);
            
            // Atualizar calendário para refletir mudanças em marcadores de tarefas
            this.renderCalendar();
        },
        
        /**
         * Fecha o painel de tarefas do dia
         */
        closeDayPanel: function() {
            if (this.dayTasksPanel) {
                this.dayTasksPanel.classList.add('hidden');
            }
        },
        
        /**
         * Abre o modal para adicionar uma tarefa com a data pré-selecionada
         */
        addTaskForSelectedDate: function() {
            if (!this.selectedDate || typeof TaskManager === 'undefined') return;
            
            // Fechar o painel de tarefas
            this.closeDayPanel();
            
            // Abrir modal de nova tarefa
            TaskManager.openTaskModal();
            
            // Definir a data selecionada no calendário
            setTimeout(() => {
                if (TaskManager.taskDueDateInput) {
                    TaskManager.taskDueDateInput.value = this.selectedDate;
                }
            }, 100);
        }
    };
    
    window.StatisticsView = {
        init: function() {
            console.log('Inicializando visualização de estatísticas');
            // Implementação básica das estatísticas
            this.updateMetrics();
            this.renderCharts();
        },
        
        updateMetrics: function() {
            // Atualizar métricas na interface
            const stats = TaskStorage.getTaskStats();
            
            // Taxa de conclusão
            const completionRate = stats.total > 0 ? Math.round((stats.concluidas / stats.total) * 100) : 0;
            document.getElementById('completion-rate').textContent = `${completionRate}%`;
            
            // Média de tarefas por dia (estimativa)
            const tasksPerDay = (stats.total / 30).toFixed(1);
            document.getElementById('tasks-per-day').textContent = tasksPerDay;
            
            // Tempo médio de conclusão (mockado)
            document.getElementById('avg-completion-time').textContent = '2.5 dias';
            
            // Percentual de tarefas atrasadas
            const overduePercentage = stats.total > 0 ? Math.round((stats.atrasadas / stats.total) * 100) : 0;
            document.getElementById('overdue-percentage').textContent = `${overduePercentage}%`;
        },
        
        renderCharts: function() {
            // Verificar se os elementos existem
            const prodChartEl = document.getElementById('productivity-chart');
            const catDistChartEl = document.getElementById('category-distribution-chart');
            const timelineChartEl = document.getElementById('progress-timeline-chart');
            
            if (!prodChartEl || !catDistChartEl || !timelineChartEl) return;
            
            // Dados mockados para os gráficos
            const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            const productivity = [1, 3, 5, 2, 4, 3, 0];
            
            // Gráfico de produtividade
            new Chart(prodChartEl, {
                type: 'bar',
                data: {
                    labels: weekdays,
                    datasets: [{
                        label: 'Tarefas Concluídas',
                        data: productivity,
                        backgroundColor: '#4361ee',
                        borderRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { precision: 0 }
                        }
                    }
                }
            });
            
            // Obter categorias
            const categories = TaskStorage.getTasksByCategory();
            const categoryLabels = Object.keys(categories).map(cat => {
                const labels = {
                    'trabalho': 'Trabalho',
                    'pessoal': 'Pessoal',
                    'estudo': 'Estudo',
                    'saude': 'Saúde',
                    'financas': 'Finanças'
                };
                return labels[cat] || cat;
            });
            const categoryValues = Object.values(categories);
            
            // Gráfico de distribuição por categoria
            new Chart(catDistChartEl, {
                type: 'doughnut',
                data: {
                    labels: categoryLabels,
                    datasets: [{
                        data: categoryValues,
                        backgroundColor: ['#4361ee', '#3a0ca3', '#4cc9f0', '#2ecc71', '#f39c12'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
            
            // Gráfico de progresso ao longo do tempo (mockado)
            const dates = Array.from({length: 7}, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                return date.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'});
            });
            
            new Chart(timelineChartEl, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Tarefas Criadas',
                        data: [2, 3, 1, 4, 2, 5, 3],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        tension: 0.3,
                        fill: true
                    }, {
                        label: 'Tarefas Concluídas',
                        data: [1, 2, 0, 3, 1, 3, 2],
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { precision: 0 }
                        }
                    }
                }
            });
        }
    };
    
    window.SettingsView = {
        init: function() {
            console.log('Inicializando configurações');
            // Implementar configurações básicas
            this.setupThemeButtons();
            this.setupColorOptions();
            this.setupDataActions();
        },
        
        setupThemeButtons: function() {
            const themeButtons = document.querySelectorAll('.settings-button[id^="theme-"]');
            themeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Remover classe 'active' de todos os botões
                    themeButtons.forEach(btn => btn.classList.remove('active'));
                    // Adicionar classe 'active' ao botão clicado
                    this.classList.add('active');
                    
                    // Aplicar tema
                    const themeId = this.id;
                    if (themeId === 'theme-dark') {
                        document.body.classList.add('dark-theme');
                        localStorage.setItem('taskflow_dark_theme', 'true');
                    } else if (themeId === 'theme-light') {
                        document.body.classList.remove('dark-theme');
                        localStorage.setItem('taskflow_dark_theme', 'false');
                    } else {
                        // Auto (baseado na preferência do sistema)
                        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                        if (prefersDark) {
                            document.body.classList.add('dark-theme');
                        } else {
                            document.body.classList.remove('dark-theme');
                        }
                        localStorage.removeItem('taskflow_dark_theme');
                    }
                });
            });
        },
        
        setupColorOptions: function() {
            const colorOptions = document.querySelectorAll('.color-option');
            colorOptions.forEach(option => {
                option.addEventListener('click', function() {
                    // Remover classe 'active' de todas as opções
                    colorOptions.forEach(opt => opt.classList.remove('active'));
                    // Adicionar classe 'active' à opção clicada
                    this.classList.add('active');
                    
                    // Obter cor selecionada
                    const color = this.getAttribute('data-color');
                    document.documentElement.style.setProperty('--primary-color', color);
                    localStorage.setItem('taskflow_primary_color', color);
                    
                    // Alerta de demonstração
                    alert('Cor alterada com sucesso! Em uma implementação completa, esta cor seria aplicada a todos os elementos.');
                });
            });
        },
        
        setupDataActions: function() {
            // Exportar dados
            const exportBtn = document.getElementById('export-data');
            if (exportBtn) {
                exportBtn.addEventListener('click', function() {
                    const tasks = TaskStorage.getTasks();
                    const dataStr = JSON.stringify(tasks, null, 2);
                    const blob = new Blob([dataStr], {type: 'application/json'});
                    const url = URL.createObjectURL(blob);
                    
                    const a = document.createElement('a');
                    a.setAttribute('hidden', '');
                    a.setAttribute('href', url);
                    a.setAttribute('download', 'taskflow_backup_' + new Date().toISOString().split('T')[0] + '.json');
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    
                    // Mostrar mensagem de sucesso
                    App.showToast('Tarefas exportadas com sucesso!', 'success');
                });
            }
            
            // Importar dados
            const importBtn = document.getElementById('import-data');
            if (importBtn) {
                importBtn.addEventListener('click', function() {
                    // Criar um input de arquivo oculto
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = '.json';
                    fileInput.style.display = 'none';
                    document.body.appendChild(fileInput);
                    
                    // Trigger click para abrir seletor de arquivo
                    fileInput.click();
                    
                    // Manipular o evento de seleção de arquivo
                    fileInput.addEventListener('change', function(e) {
                        const file = e.target.files[0];
                        if (!file) {
                            document.body.removeChild(fileInput);
                            return;
                        }
                        
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            try {
                                // Ler e validar os dados
                                const importedTasks = JSON.parse(event.target.result);
                                
                                // Verificar se os dados são válidos
                                if (!Array.isArray(importedTasks)) {
                                    throw new Error('Formato de arquivo inválido');
                                }
                                
                                // Confirmar importação (substituir ou mesclar)
                                const action = confirm('Deseja substituir todas as tarefas atuais ou mesclar com as importadas?\n\nOK = Substituir\nCancelar = Mesclar');
                                
                                if (action) {
                                    // Substituir todas as tarefas
                                    localStorage.setItem(TaskStorage.STORAGE_KEY, JSON.stringify(importedTasks));
                                    App.showToast(`${importedTasks.length} tarefas importadas com sucesso!`, 'success');
                                } else {
                                    // Mesclar tarefas (manter IDs únicos)
                                    const currentTasks = TaskStorage.getTasks();
                                    const currentIds = new Set(currentTasks.map(task => task.id));
                                    
                                    // Filtrar tarefas importadas para evitar duplicatas por ID
                                    const newTasks = importedTasks.filter(task => !currentIds.has(task.id));
                                    
                                    // Mesclar arrays
                                    const mergedTasks = [...currentTasks, ...newTasks];
                                    localStorage.setItem(TaskStorage.STORAGE_KEY, JSON.stringify(mergedTasks));
                                    App.showToast(`${newTasks.length} novas tarefas importadas com sucesso!`, 'success');
                                }
                                
                                // Recarregar a página para atualizar as tarefas
                                setTimeout(() => {
                                    window.location.reload();
                                }, 1500);
                                
                            } catch (error) {
                                console.error('Erro ao importar tarefas:', error);
                                App.showToast('Erro ao importar: formato de arquivo inválido', 'error');
                            }
                            
                            // Limpar o input de arquivo
                            document.body.removeChild(fileInput);
                        };
                        
                        reader.readAsText(file);
                    });
                });
            }
            
            // Limpar dados
            const clearBtn = document.getElementById('clear-data');
            if (clearBtn) {
                clearBtn.addEventListener('click', function() {
                    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
                        localStorage.removeItem(TaskStorage.STORAGE_KEY);
                        localStorage.removeItem('taskflow_notifications');
                        localStorage.removeItem('taskflow_categories');
                        localStorage.removeItem('taskflow_settings');
                        App.showToast('Todos os dados foram removidos', 'warning');
                        
                        // Recarregar a página
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    }
                });
            }
        }
    };
}

/**
 * Navega para uma página específica
 * @param {String} page - Identificador da página
 */
function navigateToPage(page) {
    // Atualizar página atual
    currentPage = page;
    
    // Esconder todas as páginas
    document.querySelectorAll('.page-container').forEach(pageEl => {
        pageEl.classList.add('hidden');
    });
    
    // Mostrar a página alvo
    const targetPageEl = document.getElementById(`${page}-page`);
    if (targetPageEl) {
        targetPageEl.classList.remove('hidden');
    }
    
    // Executar ações específicas para cada página
    switch (page) {
        case PAGES.DASHBOARD:
            // Atualizar dashboard
            TaskManager.loadTasks();
            ChartManager.updateCharts();
            break;
            
        case PAGES.ALL_TASKS:
            // Carregar todas as tarefas na visualização completa
            TaskManager.loadAllTasks();
            break;
            
        case PAGES.CALENDAR:
            // Inicializar ou atualizar o calendário
            CalendarView.init();
            break;
            
        case PAGES.STATISTICS:
            // Inicializar ou atualizar estatísticas detalhadas
            StatisticsView.init();
            break;
            
        case PAGES.SETTINGS:
            // Carregar configurações
            SettingsView.init();
            break;
    }
}

/**
 * Formata uma data para exibição
 * @param {String} dateString - Data em formato ISO
 * @returns {String} Data formatada
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

/**
 * Formata um valor para moeda
 * @param {Number} value - Valor a ser formatado
 * @returns {String} Valor formatado como moeda
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Valida se um formulário está completamente preenchido
 * @param {HTMLFormElement} form - Formulário a ser validado
 * @returns {Boolean} true se todos os campos obrigatórios estão preenchidos
 */
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    });
    
    return isValid;
}

/**
 * Adiciona animação de toast para feedback ao usuário
 * @param {String} message - Mensagem a ser exibida
 * @param {String} type - Tipo de toast (success, error, warning, info)
 */
function showToast(message, type = 'info') {
    // Criar elemento de toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <div class="toast-progress"></div>
    `;
    
    // Adicionar ao corpo do documento
    document.body.appendChild(toast);
    
    // Mostrar o toast
    setTimeout(() => {
        toast.classList.add('active');
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

/**
 * Retorna o ícone do Font Awesome para o tipo de toast
 * @param {String} type - Tipo de toast
 * @returns {String} Classe do ícone
 */
function getToastIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-times-circle';
        case 'warning': return 'fa-exclamation-circle';
        default: return 'fa-info-circle';
    }
}

/**
 * Configura a integração do sistema de notificações com o gerenciador de tarefas
 */
function setupNotificationsIntegration() {
    // Sobrescrever a função de adicionar/atualizar tarefa para gerar notificações
    const originalSaveTask = TaskStorage.saveTask;
    
    TaskStorage.saveTask = function(task) {
        // Verificar se é uma nova tarefa ou uma atualização
        const isNew = !task.id;
        const existingTask = !isNew ? this.getTaskById(task.id) : null;
        
        // Chamar a função original
        const savedTask = originalSaveTask.call(this, task);
        
        // Gerar notificações com base nas mudanças
        if (isNew) {
            // Nova tarefa
            createNotification('task', 'Nova Tarefa', `A tarefa "${task.title}" foi criada.`, {
                taskId: savedTask.id
            });
        } else if (existingTask) {
            // Verificar mudanças relevantes
            if (existingTask.status !== task.status && task.status === 'concluida') {
                // Tarefa marcada como concluída
                createNotification('task', 'Tarefa Concluída', `A tarefa "${task.title}" foi marcada como concluída.`, {
                    taskId: savedTask.id
                });
            } else if (existingTask.dueDate !== task.dueDate) {
                // Data de vencimento alterada
                const date = new Date(task.dueDate);
                const formattedDate = date.toLocaleDateString('pt-BR');
                createNotification('task', 'Data Alterada', `A data de vencimento da tarefa "${task.title}" foi alterada para ${formattedDate}.`, {
                    taskId: savedTask.id
                });
            }
        }
        
        return savedTask;
    };
    
    // Sobrescrever a função de excluir tarefa
    const originalDeleteTask = TaskStorage.deleteTask;
    
    TaskStorage.deleteTask = function(id) {
        // Obter a tarefa antes de excluí-la
        const task = this.getTaskById(id);
        
        // Chamar a função original
        const result = originalDeleteTask.call(this, id);
        
        // Gerar notificação se a tarefa foi excluída com sucesso
        if (result && task) {
            createNotification('system', 'Tarefa Excluída', `A tarefa "${task.title}" foi removida.`);
        }
        
        return result;
    };
    
    // Verificar tarefas com prazo próximo (para demonstração)
    checkUpcomingTasks();
}

/**
 * Verifica tarefas próximas do prazo e gera notificações
 */
function checkUpcomingTasks() {
    const tasks = TaskStorage.getTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Verificar tarefas que vencem amanhã
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Encontrar tarefas não concluídas que vencem amanhã
    const upcomingTasks = tasks.filter(task => 
        task.status !== 'concluida' && 
        task.dueDate === tomorrowStr
    );
    
    // Gerar notificações para tarefas próximas do prazo
    upcomingTasks.forEach(task => {
        createNotification('reminder', 'Prazo Próximo', 
            `A tarefa "${task.title}" vence amanhã. Não se esqueça de concluí-la a tempo!`, {
            taskId: task.id
        });
    });
}
