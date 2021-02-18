import Vue, { CreateElement, VNode } from 'vue';
import { remove } from '../async-action';
import {workerInterface} from '../main-Vdom'
import { store$ } from '../store';

export const WorkerList = Vue.extend({
    props:['workers'],
    render(ce:CreateElement):VNode{
        const workerlist = this.$props.workers.map((worker:workerInterface)=>{
            return ce('li',{
                domProps:{'id':worker.id}
            },[
                ce('img',{
                    domProps:{'src':worker.photo,'width':30,'height':30,},
                }),
                ce('span',' ' + worker.name),
                ce('button',{
                    on:{
                        click:()=>{
                            store$.dispatch<any>(remove(worker.id))
                        }
                    }
                },'hapus')
            ])
        })
        return ce('ol',workerlist)
    }
})