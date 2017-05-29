/* global angular */

var app = angular.module('yams', []);

app.controller('jeu', function ($scope) {

    $scope.dés = [];
    $scope.tirage = [];
    $scope.tour = 0;
    $scope.deChoisis = [];
    $scope.tirageMax = 3;
    $scope.rPositions = [];
    $scope.annonce = null;

    $scope.choixColumn = {
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
        6: null,
        brelan: null,
        carre: null,
        full: null,
        petiteSuite: null,
        grandeSuite: null,
        maxi: null,
        mini: null,
        onze: null,
        chance: null,
        yams: null
    };

    $scope.columns = {
        normal: Object.assign({}, $scope.choixColumn),
        descente: Object.assign({}, $scope.choixColumn),
        montee: Object.assign({}, $scope.choixColumn),
        annonce: Object.assign({}, $scope.choixColumn),
        sec: Object.assign({}, $scope.choixColumn)
    };

    $scope.order = [1, 2, 3, 4, 5, 6, 'brelan', 'carre', 'full', 'petiteSuite', 'grandeSuite', 'maxi', 'mini', 'onze', 'chance', 'yams'];

    $scope.initialize = function () {
        $scope.tirage = [];
        $scope.tour = 0;
        $scope.dés = [];
        $scope.annonce = null;
        $scope.deChoisis = [];
        for (var i = 0; i < 5; i++) {
            var dé = [1, 2, 3, 4, 5, 6];
            $scope.dés.push(dé);
        }
    };

    $scope.initialize();

    $scope.lance = function () {
        $scope.tour++;
        $scope.tirage = [];
        $scope.rPositions = [];

        for (var i = 0; i < $scope.dés.length; i++) {
            var face = $scope.dés[i][Math.floor(Math.random() * (6 - 0) + 0)];
            $scope.tirage.push(face);
            $scope.randomPosition(i);
        }

        if ($scope.annonce) {
            switch ($scope.annonce) {
                case 14:
                    $scope.remplirChance('annonce', $scope.annonce);
                    break;
                case 15:
                    $scope.remplirYams('annonce', $scope.annonce);
                    break;
            }
        }

        console.log($scope.sommeDes());
    };

    $scope.ajoutDe = function (i) {
        $scope.deChoisis.push($scope.tirage[i]);
        $scope.tirage.splice(i, 1);
        $scope.rPositions.splice(i, 1);
        $scope.dés.pop();
    };
    $scope.ausuivant = function () {
        $scope.initialize();

    };
    $scope.deEnleve = function (i) {
        $scope.tirage.push($scope.deChoisis[i]);
        $scope.deChoisis.splice(i, 1);
        $scope.dés.push([1, 2, 3, 4, 5, 6]);
    };

    $scope.randomPosition = function (i) {

        var position = null;

        while (position === null) {
            var z = $scope.calcPosition();
            var isOk = true;

            for (var i = 0; i < $scope.rPositions.length; i++) {
                var a = Math.abs(parseInt(z.left) - parseInt($scope.rPositions[i].left)) > 12;
                var b = Math.abs(parseInt(z.top) - parseInt($scope.rPositions[i].top)) > 12;
                if (!(a + b)) {
                    isOk = false;
                    break;
                }
            }

            if (isOk) {
                position = z;
            }
        }

        $scope.rPositions[i] = position;

    };

    $scope.calcPosition = function () {
        var left = Math.floor(Math.random() * (90 - 0) + 0) + '%';
        var top = Math.floor(Math.random() * (90 - 0) + 0) + '%';
        var position = {
            position: 'absolute',
            left: left,
            top: top
        };

        return position;

    };

    $scope.sommeDes = function () {
        var arr = $scope.tirage.concat($scope.deChoisis);
        return arr.reduce(function (a, b) {
            return a + b;
        }, 0);
    };

    $scope.caseImpossible = function (context, position) {
        var r = false;

        switch (context) {
            case 'descente':
                r = !($scope.columns[context][$scope.order[position]] !== null);
                break;
            case 'montee':

                var disorder = Object.assign([], $scope.order);
                disorder.reverse();
                r = !($scope.columns[context][disorder[position]] !== null);

                if (+position === 15) {
                    r = false;
                }
                break;
            case 'sec':
                r = $scope.tour > 1;
                break;
        }

        return r;
    };

    $scope.remplirChance = function (context, position) {

        if (!$scope.isAutorized(context, position)) {
            return false;
        }

        $scope.columns[context][$scope.order[position]] = $scope.sommeDes();
    };

    $scope.remplirYams = function (context, position) {


        if (!$scope.isAutorized(context, position)) {
            return false;
        }

        var arr = $scope.tirage.concat($scope.deChoisis);
        var result = 1;

        for (var i = 0; i < arr.length; i++) {
            if (arr[i] !== arr[0]) {
                result = 0;
                break;
            }
        }

        $scope.columns[context][$scope.order[position]] = result * 50;
    };

    $scope.canClick = function () {
        return $scope.tour > 0;
    };

    $scope.remplirMaxi = function (context, position) {

        if (!$scope.isAutorized(context, position)) {
            return false;
        }

        var mini = $scope.columns[context][$scope.order[12]];

        if (mini > $scope.sommeDes())
            return false;

        $scope.columns[context][$scope.order[position]] = $scope.sommeDes();

    };
    $scope.remplirMini = function (context, position) {

        if (!$scope.isAutorized(context, position)) {
            return false;
        }

        var maxi = $scope.columns[context][$scope.order[11]];

        if (maxi < $scope.sommeDes() && maxi !== null)
            return false;

        $scope.columns[context][$scope.order[position]] = $scope.sommeDes();

    };
    $scope.remplirOnze = function (context, position) {

        if (!$scope.isAutorized(context, position)) {
            return false;
        }

        if ($scope.sommeDes() > 10)
            return false;

        $scope.columns[context][$scope.order[position]] = $scope.sommeDes();

    };

    $scope.isAutorized = function (context, position) {
        if ($scope.caseImpossible(context, position))
            return false;

        if (!$scope.canClick()) {
            return false;
        }

        if (context !== 'annonce' && $scope.annonce) {
            return false;
        }

        if (context === 'annonce' && $scope.tour === 1) {
            $scope.annonce = position;
        }

        return true;
    };

});