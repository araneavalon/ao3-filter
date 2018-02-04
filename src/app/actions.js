'use strict';


export const SET_PAGE = `${__filename}:SET_PAGE`;
export const setPage = ( page ) => ( { type: SET_PAGE, page } );
