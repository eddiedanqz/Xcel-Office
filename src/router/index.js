import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/monthly',
    name: 'MonthlyDetail',
    props: true,
    component: () => import(/* webpackChunkName: "MonthlyDetail" */ '../views/MonthlyDetail.vue')
  },
  {
    path: '/update',
    name: 'UpdateRecords',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/UpdateRecords.vue')
  },
  {
    path: '/subtable',
    name: 'CreateSubTable',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/CreateSubTable.vue')
  },
  {
    path: '/performance',
    name: 'Performance',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Performance.vue')
  },
  {
    path: '/reset',
    name: 'ResetRecords',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/ResetRecords.vue')
  },
  {
    path: '/agents',
    name: 'AgentsTable',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AgentsTable.vue')
  },{
    path: '/target',
    name: 'Target',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Target.vue')
  },
  {
    path: '/daily',
    name: 'Daily',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Daily.vue')
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
