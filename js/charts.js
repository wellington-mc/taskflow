/**
 * Charts.js
 * 
 * Responsável por gerenciar os gráficos e visualizações
 * utilizando a biblioteca Chart.js
 */

const ChartManager = {
    /**
     * Inicializa os gráficos
     */
    init() {
        // Inicializar os gráficos
        this.initTasksChart();
        this.initCategoryChart();
    },
    
    /**
     * Inicializa o gráfico de progresso das tarefas
     */
    initTasksChart() {
        const ctx = document.getElementById('tasks-chart').getContext('2d');
        
        // Obter estatísticas de tarefas
        const stats = TaskStorage.getTaskStats();
        
        this.tasksChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Pendentes', 'Em Progresso', 'Concluídas', 'Atrasadas'],
                datasets: [{
                    label: 'Quantidade',
                    data: [
                        stats.pendentes,
                        stats.emProgresso,
                        stats.concluidas,
                        stats.atrasadas
                    ],
                    backgroundColor: [
                        '#f39c12',
                        '#3498db',
                        '#2ecc71',
                        '#e74c3c'
                    ],
                    borderWidth: 0,
                    borderRadius: 5,
                    maxBarThickness: 50
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#333',
                        titleFont: {
                            family: 'Poppins',
                            size: 14
                        },
                        bodyFont: {
                            family: 'Poppins',
                            size: 12
                        },
                        padding: 10,
                        boxPadding: 5
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        },
                        grid: {
                            display: true,
                            drawBorder: false,
                            color: '#e0e0e0'
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Inicializa o gráfico de distribuição por categoria
     */
    initCategoryChart() {
        const ctx = document.getElementById('category-chart').getContext('2d');
        
        // Obter tarefas por categoria
        const categoriesData = TaskStorage.getTasksByCategory();
        
        // Mapear cores por categoria
        const categoryColors = {
            'trabalho': '#4361ee',
            'pessoal': '#9b59b6',
            'estudo': '#3498db',
            'saude': '#2ecc71',
            'financas': '#27ae60'
        };
        
        // Preparar dados para o gráfico
        const labels = [];
        const data = [];
        const colors = [];
        
        for (const category in categoriesData) {
            labels.push(this.getCategoryLabel(category));
            data.push(categoriesData[category]);
            colors.push(categoryColors[category] || '#999');
        }
        
        this.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                family: 'Poppins',
                                size: 12
                            },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#333',
                        titleFont: {
                            family: 'Poppins',
                            size: 14
                        },
                        bodyFont: {
                            family: 'Poppins',
                            size: 12
                        },
                        padding: 10,
                        boxPadding: 5,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.formattedValue;
                                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                                const percentage = Math.round((context.raw / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    },
    
    /**
     * Atualiza todos os gráficos com dados mais recentes
     */
    updateCharts() {
        // Atualizar gráfico de tarefas
        if (this.tasksChart) {
            const stats = TaskStorage.getTaskStats();
            
            this.tasksChart.data.datasets[0].data = [
                stats.pendentes,
                stats.emProgresso,
                stats.concluidas,
                stats.atrasadas
            ];
            
            this.tasksChart.update();
        }
        
        // Atualizar gráfico de categorias
        if (this.categoryChart) {
            const categoriesData = TaskStorage.getTasksByCategory();
            
            const labels = [];
            const data = [];
            
            for (const category in categoriesData) {
                labels.push(this.getCategoryLabel(category));
                data.push(categoriesData[category]);
            }
            
            this.categoryChart.data.labels = labels;
            this.categoryChart.data.datasets[0].data = data;
            
            this.categoryChart.update();
        }
    },
    
    /**
     * Retorna o rótulo de uma categoria
     */
    getCategoryLabel(category) {
        const labels = {
            'trabalho': 'Trabalho',
            'pessoal': 'Pessoal',
            'estudo': 'Estudo',
            'saude': 'Saúde',
            'financas': 'Finanças'
        };
        
        return labels[category] || category;
    }
};
