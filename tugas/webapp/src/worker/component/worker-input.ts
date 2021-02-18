import Vue, { CreateElement, VNode } from 'vue';
import { register } from '../async-action';
import { clearErrorAction, errorAction, store$ } from '../store';

export const WorkerInput = Vue.extend({
    props:['input'],
    render(ce:CreateElement):VNode {
        return ce('form',{
            on:{
                submit:this.submitNewWorker
            }
        },[
            ce('label','Nama : '),
            ce('input',{
                domProps:{'placeholder':'misal Budiman'},
                on:{
                    input:(event)=>{
                        this.$props.input.name = event.target.value
                    }
                }
            },this.$props.input.name),
            ce('br'),
            ce('label','Umur : '),
            ce('input',{
                domProps:{'placeholder':'misal 23'},
                on:{
                    input:(event)=>{
                        this.$props.input.age = event.target.value
                    }
                }
            },this.$props.input.age),
            ce('br'),
            ce('label','Foto : '),
            ce('input',{
                domProps:{'type':'file'},
                on:{
                    input:(event)=>{
                        this.$props.input.photo = event.target.files[0]
                    }
                }
            },this.$props.input.photo),
            ce('br'),
            ce('label','Biodata Singkat : '),
            ce('br'),
            ce('input',{
                domProps:{'placeholder':'biodata singkat pekerja','cols':30,'rows':3},
                on:{
                    input:(event)=>{
                        this.$props.input.bio = event.target.value
                    }
                }
            },this.$props.input.bio),
            ce('br'),
            ce('label','Alamat : '),
            ce('br'),
            ce('input',{
                domProps:{'placeholder':'alamat pekerja','cols':30,'rows':3},
                on:{
                    input:(event)=>{
                        this.$props.input.address = event.target.value
                    }
                }
            },this.$props.input.address),
            ce('br'),
            ce('button',{domProps:{'type':'submit'}},'kirim'),
            ce('hr'),
        ])
    },
    methods:{
        submitNewWorker(event){
            event.preventDefault();
            store$.dispatch<any>(clearErrorAction());
            if(this.$props.input.name&&this.$props.input.age&&this.$props.input.bio&&this.$props.input.address&&this.$props.input.photo){
                store$.dispatch<any>(register(this.$props.input))
                event.target.reset()
            }
            store$.dispatch<any>(errorAction('form isian tidak lengkap!'))
            return
        }
    },
})


 