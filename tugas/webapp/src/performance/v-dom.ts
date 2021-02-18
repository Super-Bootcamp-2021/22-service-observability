import { summary } from './async-action';
import { store$ } from './store';
import './main.css';
import Vue, { CreateElement, VNode } from 'vue';
import { PerformanceItem } from './component/perform-item';

new Vue({
    el: '#app-3',
    render(createElement: CreateElement): VNode {
        return createElement('button', {
            attrs: {
                id: 'refresh'
            },
            domProps: {
                innerHTML: 'refresh'
            },
            on: {
                click: this.refresh,
            },
        })
    },
    methods: {
        refresh() {
            store$.dispatch<any>(summary);
        }
    },
})


const app = new Vue({
    el: '#app',
    components: {
        'perform-item': PerformanceItem,
    },
    render(createElement: CreateElement): VNode {
        const performances: VNode[] = [];
        for (const performance of this.performances) {
            performances.push(createElement('perform-item', { props: { performance: performance } }));
        }
        return createElement('ul', performances);
    },
    data: {
        perform: [],
        performances: [
            { text: 'jumlah pekerja', value: 0 },
            { text: 'jumlah tugas', value: 0 },
            { text: 'yang selesai', value: 0 },
            { text: 'yang dibatalkan', value: 0 },
        ],
    },
    methods: {
        loading(status) {
            new Vue({
                el: '#app-2',
                render(createElement: CreateElement):
                    VNode {
                    return createElement('p', {
                        attrs: {
                            id: 'loading-text',
                            class: 'primary',
                        },
                        domProps: {
                            innerHTML: status
                        },

                    })
                },
                data: {
                    loading: true
                },
            })
        },
        error(msg) {
            new Vue({
                el: '#app-1',
                render(createElement: CreateElement): VNode {
                    return createElement('p', {
                        attrs: {
                            id: 'error-text',
                            class: 'error'
                        },
                        domProps: {
                            innerHTML: msg
                        },
                    })
                },
                data: {
                    error: 'isi'
                }
            })
        }
    },
    mounted() {
        store$.subscribe(() => {
            this.perform = store$.getState();
            console.log('performancenya2 : ', this.perform)

            this.performances[0].value = this.perform.summary.total_worker;

            this.performances[1].value = this.perform.summary.total_task;

            this.performances[2].value = this.perform.summary.task_done;

            this.performances[3].value = this.perform.summary.task_cancelled;

            if (this.perform.error == true) {
                this.loading('memuat...')
            }
            if (this.perform.error == false) {
                this.loading('')
            }
            if (this.perform.error != null) {
                this.error(this.perform.error)
            }
        });

        this.perform = store$.getState();
        console.log('performancenya : ', this.perform)
        store$.dispatch<any>(summary);
        if (this.perform.error == true) {
            this.loading('memuat...')
        }
        if (this.perform.error == false) {
            this.loading('')
        }
        if (this.perform.error != null) {
            this.error(this.perform.error)
        }
    },
})
