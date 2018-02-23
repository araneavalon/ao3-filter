'use strict';

export const PREFIX = 'av';
export const icons = {
	'ff-net': [ 154, 154, [], 'f003', 'M 31,31 H 99 V 0 H 0 V 154 H 31 Z M 99,108 H 54 V 154 h 45 z M 154,0 H 123 V 55 H 54 v 29 h 69 V 154 H 154 Z' ],
	'ao3': [ 77.643494, 51.992302, [], 'f006', 'm 48.006488,0.22955179 a 12.5,12.5 0 0 0 -12.5,12.50000021 12.5,12.5 0 0 0 12.5,12.5 12.5,12.5 0 0 0 12.5,-12.5 12.5,12.5 0 0 0 -12.5,-12.50000021 z m 0.25,3.25000051 a 9,9 0 0 1 9,8.9999997 9,9 0 0 1 -9,9 9,9 0 0 1 -9,-9 9,9 0 0 1 9,-8.9999997 z M 21.454416,18.673588 c 0.139367,-1.435232 0.452995,-4.27692 -1.03558,-4.349436 -1.166676,-0.05683 -1.029183,2.512551 -1.139137,3.313856 -1.806374,13.164187 -6.776649,21.182444 -12.7376313,30.031812 -0.585584,0.869328 -1.523239,2.137674 -0.932022,3.003181 0.546568,0.800145 2.097422,0.750661 2.899623,0.207116 C 21.990124,41.746218 42.199243,29.739129 60.806445,30.996986 c 2.66621,0.180237 6.761455,1.174111 7.041943,3.831645 0.300638,2.848451 -8.693602,3.721958 -6.524153,5.592131 2.289508,1.97367 8.210965,3.808587 8.077522,6.834826 -1.779396,4.119794 -13.462536,0.103558 -13.462536,0.103558 0,0 -1.425864,-0.763217 -1.864044,-0.310674 -0.367315,0.379355 -0.115775,1.241966 0.310674,1.553369 4.141985,3.024577 13.742074,5.989244 17.501298,-0.414231 1.604464,-2.73305 -2.053273,-6.576884 -5.177899,-7.973964 8.524336,-4.452809 2.980943,-12.097917 -2.278275,-13.151863 -14.39454,-2.884662 -28.051324,3.433831 -37.073755,7.559732 -4.973014,2.274128 -8.442165,4.039905 -13.77321,9.009544 5.589927,-10.398232 6.95146,-15.493965 7.870406,-24.957471 z M 3.5388864,0.34382639 C 2.4012945,0.02379389 0.29359138,-0.39108871 0.01791528,0.75805829 -0.18532282,1.6052496 1.3910608,1.8665178 2.1926327,2.2078699 9.6468427,5.3822702 16.941693,9.7463302 23.939807,15.256174 c 9.964037,7.845012 16.283563,14.882612 25.164588,27.028631 0.792516,1.083874 1.455551,2.976365 2.796065,2.899623 1.475076,-0.08445 2.692507,-3.520971 2.692507,-3.520971 0,0 3.579992,-14.642307 7.766848,-20.711594 C 66.068,15.57646 77.065047,8.0071162 77.065047,8.0071162 c 0,0 0.951013,-1.723606 0.414232,-2.278275 -0.655225,-0.67706 -1.984304,-0.06407 -2.796065,0.414232 C 61.925509,12.909426 54.254574,23.961019 50.761322,37.41758 34.325412,14.356074 15.554293,4.5206962 3.5388864,0.34382639 Z' ],
};

export default Object.keys( icons ).map( ( key ) =>
	( { prefix: PREFIX, iconName: key, icon: icons[ key ] } ) );
