import Alpine from 'alpinejs';
import morph from '@alpinejs/morph'
import ajax from '../../src/index'

Alpine.plugin(morph)
Alpine.plugin(ajax)

window.Alpine = Alpine
Alpine.start();
