;
(function () {
    "use strict"

    angular.module("client.main.pages.users")
        .controller("usersDetailController", UsersDetailController)

    UsersDetailController.$inject = ['usersService', '$log', '$state', 'uiNotificationsService', 'filesService', '$scope', 'defaultImageUrl']

    function UsersDetailController(usersService, $log, $state, uiNotificationsService, filesService, $scope, defaultImageUrl) {
        const vm = this

        vm.click = _click
        vm.create = _create
        vm.update = _update
        vm.valid = _valid
        vm.validBoth = _validBoth
        vm.formValidate = _formValidate
        vm.checkPreview = _checkPreview
        vm.defaultImage = _defaultImage

        vm.useFile = false

        vm.$onInit = $init


        function $init() {
            vm.therapistSupport = vm.getViewerIds
            vm.user = vm.usersDetail
            _loadImages()
        }
        // ====================  MISC/Callback ==================================

        // If creating new user, loads image placeholder, else imagePreview = imageUrl from DB
        function _loadImages() {
            if (!vm.user) {
                vm.imagePreview = defaultImageUrl
            } else {
                vm.imagePreview = vm.user.imageUrl
            }
        }

        function _click() {
            if (!vm.user._id) {
                _create()
            } else {
                _update()
            }
        }

        function _checkImage() {
            if (!vm.user.imageUrl) {
                vm.user.imageUrl = defaultImageUrl
            }
        }

        // on-change function: If file cancelled, change payload image and image preview. Otherwise, just update image preview
        function _checkPreview() {
            if (vm.user.fileInput.length == 0) {
                vm.user.imageUrl = defaultImageUrl
                vm.useFile = false
                return vm.imagePreview = defaultImageUrl
            }
            let reader = new FileReader()
            reader.onload = function (event) {
                $scope.$apply(function () {
                    vm.imagePreview = event.target.result
                    vm.useFile = true
                })
            }
            reader.readAsDataURL(vm.user.fileInput[0])
        }

        // on-click for default pic button. Changes payload image, image preview, and changes use file input to false
        function _defaultImage() {
            if (vm.user) {
                vm.user.imageUrl = defaultImageUrl
                vm.imagePreview = defaultImageUrl
                vm.useFile = false
            }
        }

        // ========================= Validation =============================================
        function _valid(property) {
            return (
                (vm.form.$submitted && vm.form[property].$error.required) ||
                (vm.form.$submitted && vm.form[property].$error.pattern)
            )
        }

        function _valid(property) {
            return (vm.form.$submitted && vm.form[property].$error.required) || (vm.form.$submitted && vm.form[property].$error.pattern)
        }

        function _validBoth(property) {
            return vm.form.$submitted && vm.form[property].$invalid
        }

        function _formValidate(isValid) {
            if (!vm.form.$invalid) {
                _click()
            } else { return }
        }

        // =========================== AJAX =================================================

        // Create func. If fileInput exists and has a file selected and use file input is true, run aws
        // If neither input=file nor default btn were used, assigns payload with imageUrl
        function _create() {
            if (vm.useFile == true) {
                return filesService.upload(vm.user.fileInput[0])
                    .then(res => {
                        vm.user.imageUrl = res.config.url
                        _serviceCreate()
                    })
            } else {
                _checkImage()
                _serviceCreate()
            }
        }

        function _update() {
            if (vm.useFile == true) {
                return filesService.upload(vm.user.fileInput[0])
                    .then(res => {
                        vm.user.imageUrl = res.config.url
                        _serviceUpdate()
                    })
            } else {
                _serviceUpdate()
            }
        }

        function _serviceCreate() {
            usersService.create(vm.user)
                .then(response => {
                    $log.log(response)
                    uiNotificationsService.success("User successfully created.")
                    $state.go('main.users.list')
                })
                .catch(xhr => {
                    if (xhr.errors.message.includes('email_1')) {
                        uiNotificationsService.error("Your email must be unique.")
                    }
                    if (xhr.errors.message.includes('username_1')) {
                        uiNotificationsService.error("Your username must be unique.")
                    }
                    $log.log(xhr)
                    uiNotificationsService.error("An error occurred while attempting to create the user.")
                })
        }

        function _serviceUpdate() {
            usersService.update(vm.user._id, vm.user)
                .then(response => {
                    $log.log(response)
                    uiNotificationsService.success("User successfully updated.")
                    $state.go('main.users.list')
                })
                .catch(xhr => {
                    $log.log(xhr)
                    uiNotificationsService.error('An error occurred while attempting to update the user.')
                })
        }


    }

})();
; (function () {
    angular.module('client.main.pages.users')
        .component('usersDetail', {
            templateUrl: 'client/main/pages/users/detail/users.detail.html'
            , controller: "usersDetailController"
            , bindings: {
                usersDetail: '<',
                getViewerIds: '<'
            }
        })
})()
