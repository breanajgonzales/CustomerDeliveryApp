'use strict';

/* Controllers */

angular.module('addressBookApp.controllers', [])
    .controller('BaseController', ['$scope', '$location', '$window', 'Restangular', 'SessionService', function($scope, $location, $window, Restangular, SessionService) {
        $scope.userSession = SessionService.getUserSession();
        if (SessionService.hasOwnProperty('_id')) {
            $scope.accountId = SessionService.getUserSession()._id;
        }
/* We need to watch SessionService and update accountId once SessionService has _id.*/

        $scope.isActive = function(viewLocation) {
            if (typeof viewLocation == "object") {
                var active = false;
                for (var i = 0; i < viewLocation.length; i++) {
                    if (viewLocation[i] == $location.path()) {
                        active = true;
                    }
                }
                return active;
            } else {
                return viewLocation == $location.path();
            }
        };

        $scope.doLogout = function() {
            Restangular.one('account/logout').post()
                .then(function(data) {
                    SessionService.removeUserSession();
                    $window.location = '/';
                }), function(response) {
                $scope.message = response;
            };
        };
    }])
    .controller('LoginController', ['$scope', '$window', 'loginTitle', 'Restangular', 'SessionService', function($scope, $window, loginTitle, Restangular, SessionService) {
        $scope.user = {}

        $scope.register = function() {
            $window.location = '/register';
        }

        $scope.doLogin = function() {
            console.log('Logging in user: ' + $scope.user.email);
            var user = {
                'email': $scope.user.email,
                'password': $scope.user.password
            };

            Restangular.all('account/login').customPOST(user)
                .then(function(data) {
                    if (data == 'Unauthorized') {
                        $scope.errorMessage = 'Invalid username and/or password';
                    } else {
                        SessionService.saveUserSession(data);
                        $scope.userSession = data;
                        $window.location = '/home';
                    }
                }), function(response) {
                $scope.errorMessage = response;
            };
        }

        $scope.hasError = function(field, validation) {
            if (validation) {
                return $scope.loginForm[field].$dirty && $scope.loginForm[field].$error[validation];
            }
            return $scope.loginForm[field].$dirty && $scope.loginForm[field].$invalid;
        };

        $scope.loginTitle = loginTitle;
    }])
    .controller('IndexController', ['$scope', '$http', 'SessionService', function($scope, $http, SessionService) {
    }])
    .controller('RegisterController', ['$scope', '$window', 'registerConstants', 'Restangular', 'SessionService', function($scope, $window, registerConstants, Restangular, SessionService) {
        $scope.user = {}

        $scope.doRegister = function() {
            var user = {
                'email': $scope.user.email,
                'password': $scope.user.password,
                'username': $scope.user.email,
                'created': new Date(),
                'first_name': $scope.user.first_name,
                'last_name': $scope.user.last_name
            };

            Restangular.all('account/register').customPOST(user)
                .then(function(data) {
                    SessionService.saveUserSession(data);
                    $window.location = '/home';
                }), function(response) {
                console.log('Register error: ' + response);
                $scope.errorMessage = response;
            };
        }

        $scope.hasError = function(field, validation) {
            if (validation) {
                return $scope.registerForm[field].$dirty && $scope.registerForm[field].$error[validation];
            }

            return $scope.registerForm[field].$dirty && $scope.registerForm[field].$invalid;
        };

        $scope.registerTitle = registerConstants['title'];
        $scope.registerSubTitle = registerConstants['subTitle'];
    }])

    .controller('EditAccountController', ['$scope', '$http', '$routeParams', 'SessionService','Restangular', '$window', function ($scope, $http, $routeParams, SessionService, Restangular, $window) {

        $scope.accountId = SessionService.getUserSession()._id;

        Restangular.one('api/account/' + $scope.accountId).customGET()
            .then(function(data) {
                $scope.account = data.account[0];
            });

        $scope.editAccount = function() {

            Restangular.one('api/account/' + $scope.accountId).customPUT($scope.account)
                .then(function(data) {
                    $window.location = '/accounts';
                });

        }
    }])

    .controller('ContactController', ['$scope','Restangular', 'SessionService', function($scope, Restangular, SessionService ) {
        Restangular.all('api/contacts').customGET()
            .then(function(data) {
                $scope.contacts = data.contacts;
            }), function(response) {
            console.log("Error retrieving contacts: " + response);
        };

        // $scope.contact = SessionService.getCurrentContact();

        $scope.deleteContact = function (contactId) {
            Restangular.one('api/contact/' + contactId).remove()
                .then(function (data) {
                    $scope.contacts = data.contacts;
                })
        };

        $scope.openModal = function (contactId) {
            $scope.target = '#' + contactId;
        };

        //modal stuff
/*        $scope.items = ['item1', 'item2', 'item3'];

        $scope.open = function () {

            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: ModalInstanceCtrl,
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };*/


    }])

    .controller('EditContactController', ['$scope', '$http', '$routeParams', 'Restangular', '$window', function ($scope, $http, $routeParams, Restangular, $window) {

        $scope.states = ["Alaska", "Alabama", "Arkansas", "Arizona", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia","Hawaii", "Iowa", "Idaho", "Illinois", "Indiana", "Kansas", "Kentucky", "Louisiana", "Massachusetts", "Maryland", "Maine", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "North Carolina", "North Dakota","Nebraska","New Hampshire","New Jersey","New Mexico","Nevada","New York","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Virginia","Vermont","Washington","Wisconsin","West Virginia","Wyoming"];

        $scope.contactId = $routeParams.id;

        Restangular.one('api/contact/' + $scope.contactId).customGET()
            .then(function(data) {
                $scope.contact = data.contact[0];
            });

        $scope.editContact = function() {

            Restangular.one('api/contact/' + $scope.contactId).customPUT($scope.contact)
                .then(function(data) {
                    $window.location = '/contacts';
                });

        }
    }])

    .controller('AddContactController', ['$scope', '$window', 'contactConstants', 'Restangular', 'SessionService', function ($scope, $window, contactConstants, Restangular, SessionService) {
        $scope.contact = {};
        $scope.states = ["Alaska", "Alabama", "Arkansas", "Arizona", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia","Hawaii", "Iowa", "Idaho", "Illinois", "Indiana", "Kansas", "Kentucky", "Louisiana", "Massachusetts", "Maryland", "Maine", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "North Carolina", "North Dakota","Nebraska","New Hampshire","New Jersey","New Mexico","Nevada","New York","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Virginia","Vermont","Washington","Wisconsin","West Virginia","Wyoming"];
        $scope.addContact = function () {
    var contact = {
        'first_name': $scope.contact.first_name,
        'last_name': $scope.contact.last_name,
        'company': $scope.contact.company,
        'phone': $scope.contact.phone,
        'email': $scope.contact.email,
        'address': $scope.contact.address,
        'city': $scope.contact.city,
        'state': $scope.contact.state,
        'zipcode': $scope.contact.zipcode,
        'created': new Date()
    };

    Restangular.all('api/contact').customPOST(contact)
        .then(function (data) {
            SessionService.saveCurrentContact(data.contact);
            $window.location = '/contacts';
        }), function (response) {
        $scope.errorMessage = response;
    };
}

    $scope.hasError = function (field, validation) {
    if (validation) {
        return $scope.contactForm[field].$dirty && $scope.contactForm[field].$error[validation];
    }

    return $scope.contactForm[field].$dirty && $scope.contactForm[field].$invalid;
};

    $scope.contactTitle = contactConstants['title'];
    $scope.contactSubTitle = contactConstants['subTitle'];
    }])
    .controller('ProductController', ['$scope', '$window', 'Restangular', 'SessionService', function($scope, $window, Restangular, SessionService) {
        $scope.product = {};

        $scope.addProduct = function() {

            var product = {
                'product_name': $scope.product.product_name,
                'description': $scope.product.description,
                'price': $scope.product.price
            };

            Restangular.all('api/product').customPOST(product)
                .then(function(data) {
                    SessionService.saveCurrentProduct(data.product);
                    $window.location = '/products';
                }), function(response) {
                $scope.errorMessage = response;
            };
        };

        $scope.hasError = function(field, validation) {
            if (validation) {
                return $scope.productForm[field].$dirty && $scope.productForm[field].$error[validation];
            }

            return $scope.productForm[field].$dirty && $scope.productForm[field].$invalid;
        };

        Restangular.all('api/products').customGET()
            .then(function(data) {
                $scope.products = data.products;
            }), function(response) {
            console.log("Error retrieving products: " + response);
        };

        $scope.product = SessionService.getCurrentProduct();

        $scope.deleteProduct = function (productId) {
            Restangular.one('api/product/' + productId).remove()
                .then(function (data) {
                    $scope.products = data.products;
                }), function (response) {
                $scope.errorMessage = response;
            };
        };
    }])
    .controller('EditProduct', ['$scope', '$http', '$routeParams', 'Restangular', '$window', function($scope, $http, $routeParams, Restangular, $window) {

        $scope.productId = $routeParams.id;

        Restangular.one('api/product/' + $scope.productId).customGET()
            .then(function (data) {
                $scope.product = data.product[0];
            });

        $scope.editProduct = function() {

        Restangular.one('api/product/' + $scope.productId).customPUT($scope.product)
            .then(function (data) {
                $window.location = '/products';
            });

        }


    }]);
 /*   .controller('ModalDemoCtrl', ['$scope', '$items', '$modalInstance', function ($scope, $modal, $items, $modalInstance) {

        $scope.items = items;
        $scope.selected = {
            item: $scope.items[0]
        };

        $scope.ok = function () {
            $modalInstance.close($scope.selected.item);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);*/