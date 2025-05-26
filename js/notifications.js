/**
 * Notifications.js
 * 
 * Responsável por gerenciar o sistema de notificações
 */

const NotificationManager = {
    /**
     * Chave utilizada para armazenar as notificações no localStorage
     */
    STORAGE_KEY: 'taskflow_notifications',
    
    /**
     * Inicializa o gerenciador de notificações
     */
    init() {
        // Elementos da interface
        this.notificationsBtn = document.getElementById('notifications-btn');
        this.notificationsPanel = document.getElementById('notifications-panel');
        this.notificationsList = document.getElementById('notifications-list');
        this.notificationCount = document.getElementById('notification-count');
        this.emptyNotifications = document.getElementById('empty-notifications');
        this.markAllReadBtn = document.getElementById('mark-all-read');
        this.closeNotificationsBtn = document.getElementById('close-notifications');
        
        // Configurar eventos
        if (this.notificationsBtn) {
            this.notificationsBtn.addEventListener('click', () => this.togglePanel());
        }
        
        if (this.markAllReadBtn) {
            this.markAllReadBtn.addEventListener('click', () => this.markAllAsRead());
        }
        
        if (this.closeNotificationsBtn) {
            this.closeNotificationsBtn.addEventListener('click', () => this.closePanel());
        }
        
        // Fechar painel ao clicar fora dele
        document.addEventListener('click', (e) => {
            if (this.notificationsPanel && 
                !this.notificationsPanel.contains(e.target) && 
                !this.notificationsBtn.contains(e.target)) {
                this.closePanel();
            }
        });
        
        // Carregar notificações
        this.loadNotifications();
        
        // Carregar dados de exemplo se não houver notificações
        this.loadSampleNotifications();
        
        // Atualizar contador
        this.updateNotificationCount();
    },
    
    /**
     * Recupera todas as notificações armazenadas
     * @returns {Array} Lista de notificações ou array vazio se não houver notificações
     */
    getNotifications() {
        const notificationsJson = localStorage.getItem(this.STORAGE_KEY);
        return notificationsJson ? JSON.parse(notificationsJson) : [];
    },
    
    /**
     * Salva a lista de notificações no localStorage
     * @param {Array} notifications - Lista de notificações para salvar
     */
    saveNotifications(notifications) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
    },
    
    /**
     * Adiciona uma nova notificação
     * @param {Object} notification - Notificação a ser adicionada
     * @returns {Object} A notificação adicionada
     */
    addNotification(notification) {
        const notifications = this.getNotifications();
        
        // Adicionar ID, timestamp e status padrão
        notification.id = this.generateId();
        notification.timestamp = new Date().toISOString();
        notification.read = false;
        
        // Adicionar à lista
        notifications.unshift(notification);
        
        // Salvar
        this.saveNotifications(notifications);
        
        // Atualizar interface
        this.loadNotifications();
        this.updateNotificationCount();
        
        return notification;
    },
    
    /**
     * Marca uma notificação como lida
     * @param {String} id - ID da notificação
     */
    markAsRead(id) {
        const notifications = this.getNotifications();
        const index = notifications.findIndex(n => n.id === id);
        
        if (index !== -1) {
            notifications[index].read = true;
            this.saveNotifications(notifications);
            this.updateNotificationCount();
            
            // Atualizar item na lista
            const notificationEl = document.querySelector(`.notification-item[data-id="${id}"]`);
            if (notificationEl) {
                notificationEl.classList.remove('unread');
            }
        }
    },
    
    /**
     * Marca todas as notificações como lidas
     */
    markAllAsRead() {
        const notifications = this.getNotifications();
        
        // Marcar todas como lidas
        notifications.forEach(notification => {
            notification.read = true;
        });
        
        // Salvar
        this.saveNotifications(notifications);
        
        // Atualizar interface
        this.loadNotifications();
        this.updateNotificationCount();
    },
    
    /**
     * Remove uma notificação
     * @param {String} id - ID da notificação
     */
    removeNotification(id) {
        const notifications = this.getNotifications().filter(n => n.id !== id);
        this.saveNotifications(notifications);
        
        // Atualizar interface
        this.loadNotifications();
        this.updateNotificationCount();
    },
    
    /**
     * Carrega e renderiza as notificações na interface
     */
    loadNotifications() {
        if (!this.notificationsList) return;
        
        const notifications = this.getNotifications();
        
        // Mostrar mensagem se não houver notificações
        if (notifications.length === 0) {
            this.notificationsList.innerHTML = '';
            if (this.emptyNotifications) {
                this.emptyNotifications.classList.remove('hidden');
            }
            return;
        }
        
        // Esconder mensagem de vazio
        if (this.emptyNotifications) {
            this.emptyNotifications.classList.add('hidden');
        }
        
        // Limpar lista
        this.notificationsList.innerHTML = '';
        
        // Renderizar cada notificação
        notifications.forEach(notification => {
            const notificationEl = document.createElement('li');
            notificationEl.className = `notification-item ${notification.read ? '' : 'unread'}`;
            notificationEl.dataset.id = notification.id;
            
            // Formatar a data/hora
            const timestamp = new Date(notification.timestamp);
            const timeAgo = this.getTimeAgo(timestamp);
            
            // Definir ícone com base no tipo
            let iconClass = 'fas fa-bell';
            if (notification.type === 'task') {
                iconClass = 'fas fa-tasks';
            } else if (notification.type === 'reminder') {
                iconClass = 'fas fa-clock';
            } else if (notification.type === 'system') {
                iconClass = 'fas fa-cog';
            }
            
            notificationEl.innerHTML = `
                <div class="notification-icon ${notification.type || ''}">
                    <i class="${iconClass}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <span class="notification-time">${timeAgo}</span>
                </div>
            `;
            
            // Evento para marcar como lida ao clicar
            notificationEl.addEventListener('click', () => {
                this.markAsRead(notification.id);
                
                // Se houver uma ação associada, executá-la
                if (notification.action) {
                    this.handleNotificationAction(notification);
                }
            });
            
            this.notificationsList.appendChild(notificationEl);
        });
    },
    
    /**
     * Lida com a ação associada a uma notificação
     * @param {Object} notification - A notificação
     */
    handleNotificationAction(notification) {
        // Fechar o painel
        this.closePanel();
        
        // Executar ação com base no tipo
        if (notification.type === 'task' && notification.taskId) {
            // Abrir modal de edição da tarefa
            if (typeof TaskManager !== 'undefined') {
                TaskManager.editTask(notification.taskId);
            }
        } else if (notification.type === 'reminder' && notification.page) {
            // Navegar para a página especificada
            if (typeof navigateToPage !== 'undefined') {
                navigateToPage(notification.page);
            }
        }
    },
    
    /**
     * Atualiza o contador de notificações não lidas
     */
    updateNotificationCount() {
        if (!this.notificationCount) return;
        
        const unreadCount = this.getUnreadCount();
        
        if (unreadCount > 0) {
            this.notificationCount.textContent = unreadCount;
            this.notificationCount.classList.remove('hidden');
        } else {
            this.notificationCount.classList.add('hidden');
        }
    },
    
    /**
     * Retorna o número de notificações não lidas
     * @returns {Number} Número de notificações não lidas
     */
    getUnreadCount() {
        return this.getNotifications().filter(n => !n.read).length;
    },
    
    /**
     * Alterna a visibilidade do painel de notificações
     */
    togglePanel() {
        if (!this.notificationsPanel) return;
        
        this.notificationsPanel.classList.toggle('hidden');
    },
    
    /**
     * Fecha o painel de notificações
     */
    closePanel() {
        if (!this.notificationsPanel) return;
        
        this.notificationsPanel.classList.add('hidden');
    },
    
    /**
     * Gera um ID único para uma nova notificação
     * @returns {String} ID único
     */
    generateId() {
        return 'notification_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },
    
    /**
     * Formata o tempo decorrido desde uma data
     * @param {Date} date - Data a ser formatada
     * @returns {String} Tempo decorrido formatado
     */
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffSec < 60) {
            return 'agora mesmo';
        } else if (diffMin < 60) {
            return `${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'} atrás`;
        } else if (diffHour < 24) {
            return `${diffHour} ${diffHour === 1 ? 'hora' : 'horas'} atrás`;
        } else if (diffDay < 30) {
            return `${diffDay} ${diffDay === 1 ? 'dia' : 'dias'} atrás`;
        } else {
            return date.toLocaleDateString('pt-BR');
        }
    },
    
    /**
     * Carrega notificações de exemplo se não houver notificações
     */
    loadSampleNotifications() {
        const notifications = this.getNotifications();
        
        if (notifications.length === 0) {
            // Criar algumas notificações de exemplo
            const now = new Date();
            
            const sampleNotifications = [
                {
                    id: 'sample1',
                    type: 'task',
                    title: 'Tarefa próxima do prazo',
                    message: 'A tarefa "Estudar JavaScript avançado" vence amanhã.',
                    timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
                    read: false,
                    taskId: 'sample2'
                },
                {
                    id: 'sample2',
                    type: 'system',
                    title: 'Bem-vindo ao TaskFlow!',
                    message: 'Organize suas tarefas de forma eficiente com nosso aplicativo.',
                    timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
                    read: false
                },
                {
                    id: 'sample3',
                    type: 'reminder',
                    title: 'Confira suas estatísticas',
                    message: 'Veja como está seu desempenho na conclusão de tarefas.',
                    timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(),
                    read: false,
                    page: 'statistics'
                }
            ];
            
            this.saveNotifications(sampleNotifications);
            this.loadNotifications();
            this.updateNotificationCount();
        }
    }
};

// Adicionar método global para criar notificações a partir de outros módulos
window.createNotification = function(type, title, message, options = {}) {
    if (typeof NotificationManager !== 'undefined') {
        return NotificationManager.addNotification({
            type,
            title,
            message,
            ...options
        });
    }
    return null;
};
