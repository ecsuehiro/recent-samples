; (function () {
    "use strict"

    angular.module("client.main.pages.users", [
        "ui.router",
        "client.services",
        "ngMask",
        "client.directives"
    ])

    angular.module("client.main.pages.users").config(RouteConfig)

    RouteConfig.$inject = ["$stateProvider"]

    function RouteConfig($stateProvider) {
        $stateProvider
            .state("main.users", {
                url: "/admin/users",
                abstract: true,
                views: {
                    "body@main": {
                        templateUrl: "client/main/pages/users/main.users.html"
                    }
                }
            })
            .state("main.users.list", {
                url: "/list",
                views: {
                    "users@main.users": {
                        component: "usersList"
                    }
                },
                resolve: {
                    usersList: getAllUsers
                }
            })
            .state("main.users.detail", {
                url: "/detail/:id",
                views: {
                    "users@main.users": {
                        component: "usersDetail"
                    }
                },
                resolve: {
                    usersDetail: getAllById,
                    getViewerIds: getViewerIds
                },
                params: {
                    id: null
                }
            })
    }

    getAllUsers.$inject = ['usersService', '$log']
    getAllById.$inject = ['usersService', '$log', '$stateParams']
    getViewerIds.$inject = ['usersService', '$q']

    function getAllUsers(usersService, $log) {
        return usersService
            .read()
            .then(data => data.items)
            .catch(xhr => {
                $log.log(xhr)
            })
    }

    function getAllById(usersService, $log, $stateParams) {
        if (!$stateParams.id) { return }
        return usersService
            .readById($stateParams.id)
            .then(data => {
                return data.item
            })
            .catch(xhr => {
                $log.log(xhr)
            })
    }

    function getViewerIds(usersService, $q) {
        let viewers = []
        return $q.all([
            usersService.readClients(),
            usersService.readTherapists(),
            usersService.readSupporters()
        ])
            .then(data => {
                for (let k = 0; k < data.length; k++) {
                    for (let i = 0; i < data[k].items.length; i++) {
                        viewers.push(data[k].items[i])
                    }
                }
                return viewers
            })
            .catch(data => data.error)
    }



})();