import Vue from "vue";
import VueRouter from "vue-router";

import LoginPage from './pages/login-page.vue'


import MainPage from './pages/main-page.vue'
    import Users from './pages/users.vue'
    import Deals from './pages/deals.vue'
    import Watcher from './pages/watcher.vue'
        import WatcherObjects from './pages/deal-pages/watcher/objects'
        import WatcherObjectView from './pages/deal-pages/watcher/object-view'
    import DealView from './pages/deal-view.vue'
        import ShipInfo from './pages/deal-pages/ship-info'
        import BankGuaratees from './pages/deal-pages/about/bank-guarantees'
        import Limit from './pages/deal-pages/about/limit'
        import Objects from './pages/deal-pages/objects'
            import ObjectView from './pages/deal-pages/objects/object-view'
                import AboutObject from './pages/deal-pages/objects/about'
                import Whatchers from './pages/deal-pages/objects/watchers'
                import UP from './pages/deal-pages/objects/up'
                import USh from './pages/deal-pages/objects/ush'
                import UH from './pages/deal-pages/objects/uh'
            import PaymentStages from './pages/deal-pages/payment-stages'
            import KeyEvents from './pages/deal-pages/key-events'
            import ClaimWork from './pages/deal-pages/claim-work/claim-work'
            import JudicalWork from './pages/deal-pages/claim-work/judical-work'
            import CashExecution from './pages/deal-pages/cash-execution'
        
Vue.use(VueRouter);

export default new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
        path: '/login',
        component: LoginPage
    },
    {
        path: '/users',
        component : Users
    },
    {
        path: '/watcher',
        component: Watcher,
        children: [
            {
                path: '/watcher/objects/',
                component: WatcherObjects
            },
            {
                path: '/watcher/objects/:idObject',
                component: WatcherObjectView,
                children: [
                    {
                        path: '/watcher/objects/:idObject/UP',
                        component: UP
                    },
                    {
                        path: '/watcher/objects/:idObject/USh',
                        component: USh
                    },
                    {
                        path: '/watcher/objects/:idObject/UH',
                        component: UH
                    }
                ]
            }
        ]
    },
    {
        path: '/main',
        component: MainPage,
        children: [
            {
                path: '',
                component: Deals
            },
            {
                path: '/deal/:id',
                component: DealView,
                children: [
                    {
                        path : '/deal/:id/ship-info',
                        component : ShipInfo
                    },
                    {
                        path : '/deal/:id/bank-guarantees',
                        component : BankGuaratees
                    },
                    {
                        path : '/deal/:id/limits',
                        component : Limit
                    },
                    {
                        path : '/deal/:id/objects',
                        component : Objects
                    },
                    {
                        path : '/deal/:id/objects/:idObject/',
                        component : ObjectView,
                        children : [
                            {
                                path: '/deal/:id/objects/:idObject/about',
                                component: AboutObject
                            },
                            {
                                path: '/deal/:id/objects/:idObject/watchers',
                                component: Whatchers
                            },
                            {
                                path: '/deal/:id/objects/:idObject/UP',
                                component: UP
                            },
                            {
                                path: '/deal/:id/objects/:idObject/USh',
                                component: USh
                            },
                            {
                                path: '/deal/:id/objects/:idObject/UH',
                                component: UH
                            }
                        ]
                    },
                    {
                        path : '/deal/:id/payment-stages',
                        component : PaymentStages
                    },
                    {
                        path : '/deal/:id/key-events',
                        component : KeyEvents
                    },
                    {
                        path : '/deal/:id/claim-work',
                        component : ClaimWork
                    },
                    {
                        path : '/deal/:id/judical-work',
                        component : JudicalWork
                    },
                    {
                        path : '/deal/:id/cash-execution',
                        component : CashExecution
                    }
                ]
            }
        ]
    }
  ]
});
