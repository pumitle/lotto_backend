import PropTypes from "prop-types";

let _CustomersIdxGetRes;
_CustomersIdxGetRes = PropTypes.shape({
    "Uid": PropTypes.number,
    "name": PropTypes.string,
    "email": PropTypes.string,
    "password": PropTypes.string,
    "phone": PropTypes.string,
    "image": PropTypes.string,
    "type": PropTypes.string,
});

export const CustomersIdxGetRes = _CustomersIdxGetRes;
