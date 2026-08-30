import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        //Add others as needed. One will be for inference and another for training.
        {
            path: '/infer',
            name: 'infer',
            component: () => import('./views/InferenceView.vue')
        },
        {
            path: '/train',
            name: 'train',
            component: () => import('./views/TrainingView.vue')
        },
        {
            path: '/vocabmanagement',
            name: 'vocab',
            component: () => import('./views/VocabularyManagementView.vue')
        },
        {
            path: '/configmanagement',
            name: 'config',
            component: () => import('./views/ConfigManagerView.vue')
        },
        {
            path: '/models',
            name: 'models',
            component: () => import('./views/TransformerModelView.vue')
        },
        //Catch-all
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('./views/NotFoundView.vue')
        }
    ]
});

export default router;