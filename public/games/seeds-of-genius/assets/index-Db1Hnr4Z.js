(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=1e3,t=1001,n=1002,r=1003,i=1004,a=1005,o=1006,s=1007,c=1008,l=1009,u=1010,d=1011,f=1012,p=1013,m=1014,h=1015,g=1016,_=1017,v=1018,y=1020,b=35902,x=35899,S=1021,C=1022,w=1023,T=1026,E=1027,D=1028,ee=1029,O=1030,k=1031,te=1033,ne=33776,A=33777,re=33778,j=33779,M=35840,ie=35841,ae=35842,oe=35843,se=36196,ce=37492,le=37496,ue=37808,de=37809,fe=37810,pe=37811,me=37812,he=37813,ge=37814,_e=37815,N=37816,ve=37817,ye=37818,be=37819,P=37820,xe=37821,F=36492,I=36494,Se=36495,Ce=36283,we=36284,Te=36285,Ee=36286,De=2300,Oe=2301,ke=2302,Ae=2400,je=2401,Me=2402,Ne=3200,Pe=3201,Fe=`srgb`,Ie=`srgb-linear`,Le=`linear`,Re=`srgb`,ze=7680,Be=35044,Ve=2e3,He=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},Ue=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),We=Math.PI/180,Ge=180/Math.PI;function Ke(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Ue[e&255]+Ue[e>>8&255]+Ue[e>>16&255]+Ue[e>>24&255]+`-`+Ue[t&255]+Ue[t>>8&255]+`-`+Ue[t>>16&15|64]+Ue[t>>24&255]+`-`+Ue[n&63|128]+Ue[n>>8&255]+`-`+Ue[n>>16&255]+Ue[n>>24&255]+Ue[r&255]+Ue[r>>8&255]+Ue[r>>16&255]+Ue[r>>24&255]).toLowerCase()}function L(e,t,n){return Math.max(t,Math.min(n,e))}function qe(e,t){return(e%t+t)%t}function Je(e,t,n){return(1-n)*e+n*t}function Ye(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`Invalid component type.`)}}function Xe(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`Invalid component type.`)}}var R=class e{constructor(t=0,n=0){e.prototype.isVector2=!0,this.x=t,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=L(this.x,e.x,t.x),this.y=L(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=L(this.x,e,t),this.y=L(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(L(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(L(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ze=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(o===0){e[t+0]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u;return}if(o===1){e[t+0]=d,e[t+1]=f,e[t+2]=p,e[t+3]=m;return}if(u!==m||s!==d||c!==f||l!==p){let e=1-o,t=s*d+c*f+l*p+u*m,n=t>=0?1:-1,r=1-t*t;if(r>2**-52){let i=Math.sqrt(r),a=Math.atan2(i,t*n);e=Math.sin(e*a)/i,o=Math.sin(o*a)/i}let i=o*n;if(s=s*e+d*i,c=c*e+f*i,l=l*e+p*i,u=u*e+m*i,e===1-o){let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:console.warn(`THREE.Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(L(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,r=this._y,i=this._z,a=this._w,o=a*e._w+n*e._x+r*e._y+i*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=r,this._z=i,this;let s=1-o*o;if(s<=2**-52){let e=1-t;return this._w=e*a+t*this._w,this._x=e*n+t*this._x,this._y=e*r+t*this._y,this._z=e*i+t*this._z,this.normalize(),this}let c=Math.sqrt(s),l=Math.atan2(c,o),u=Math.sin((1-t)*l)/c,d=Math.sin(t*l)/c;return this._w=a*u+this._w*d,this._x=n*u+this._x*d,this._y=r*u+this._y*d,this._z=i*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},z=class e{constructor(t=0,n=0,r=0){e.prototype.isVector3=!0,this.x=t,this.y=n,this.z=r}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion($e.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion($e.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=L(this.x,e.x,t.x),this.y=L(this.y,e.y,t.y),this.z=L(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=L(this.x,e,t),this.y=L(this.y,e,t),this.z=L(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(L(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Qe.copy(this).projectOnVector(e),this.sub(Qe)}reflect(e){return this.sub(Qe.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(L(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Qe=new z,$e=new Ze,B=class e{constructor(t,n,r,i,a,o,s,c,l){e.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(et.makeScale(e,t)),this}rotate(e){return this.premultiply(et.makeRotation(-e)),this}translate(e,t){return this.premultiply(et.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},et=new B;function tt(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function nt(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function rt(){let e=nt(`canvas`);return e.style.display=`block`,e}var it={};function at(e){e in it||(it[e]=!0,console.warn(e))}function ot(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var st=new B().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ct=new B().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function lt(){let e={enabled:!0,workingColorSpace:Ie,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=ut(e.r),e.g=ut(e.g),e.b=ut(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=dt(e.r),e.g=dt(e.g),e.b=dt(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Le:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return at(`THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return at(`THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Ie]:{primaries:t,whitePoint:r,transfer:Le,toXYZ:st,fromXYZ:ct,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Fe},outputColorSpaceConfig:{drawingBufferColorSpace:Fe}},[Fe]:{primaries:t,whitePoint:r,transfer:Re,toXYZ:st,fromXYZ:ct,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Fe}}}),e}var V=lt();function ut(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function dt(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var ft,pt=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{ft===void 0&&(ft=nt(`canvas`)),ft.width=e.width,ft.height=e.height;let t=ft.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=ft}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=nt(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=ut(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(ut(t[e]/255)*255):t[e]=ut(t[e]);return{data:t,width:e.width,height:e.height}}return console.warn(`THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},mt=0,ht=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:mt++}),this.uuid=Ke(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(gt(r[t].image)):e.push(gt(r[t]))}else e=gt(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function gt(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?pt.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(console.warn(`THREE.Texture: Unable to serialize Texture.`),{})}var _t=0,vt=new z,yt=class r extends He{constructor(e=r.DEFAULT_IMAGE,n=r.DEFAULT_MAPPING,i=t,a=t,s=o,u=c,d=w,f=l,p=r.DEFAULT_ANISOTROPY,m=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:_t++}),this.uuid=Ke(),this.name=``,this.source=new ht(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=a,this.magFilter=s,this.minFilter=u,this.anisotropy=p,this.format=d,this.internalFormat=null,this.type=f,this.offset=new R(0,0),this.repeat=new R(1,1),this.center=new R(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new B,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(vt).x}get height(){return this.source.getSize(vt).y}get depth(){return this.source.getSize(vt).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(r){if(this.mapping!==300)return r;if(r.applyMatrix3(this.matrix),r.x<0||r.x>1)switch(this.wrapS){case e:r.x-=Math.floor(r.x);break;case t:r.x=r.x<0?0:1;break;case n:Math.abs(Math.floor(r.x)%2)===1?r.x=Math.ceil(r.x)-r.x:r.x-=Math.floor(r.x)}if(r.y<0||r.y>1)switch(this.wrapT){case e:r.y-=Math.floor(r.y);break;case t:r.y=r.y<0?0:1;break;case n:Math.abs(Math.floor(r.y)%2)===1?r.y=Math.ceil(r.y)-r.y:r.y-=Math.floor(r.y)}return this.flipY&&(r.y=1-r.y),r}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};yt.DEFAULT_IMAGE=null,yt.DEFAULT_MAPPING=300,yt.DEFAULT_ANISOTROPY=1;var bt=class e{constructor(t=0,n=0,r=0,i=1){e.prototype.isVector4=!0,this.x=t,this.y=n,this.z=r,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=L(this.x,e.x,t.x),this.y=L(this.y,e.y,t.y),this.z=L(this.z,e.z,t.z),this.w=L(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=L(this.x,e,t),this.y=L(this.y,e,t),this.z=L(this.z,e,t),this.w=L(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(L(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},xt=class extends He{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:o,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new bt(0,0,e,t),this.scissorTest=!1,this.viewport=new bt(0,0,e,t);let r=new yt({width:e,height:t,depth:n.depth});this.textures=[];let i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:o,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isArrayTexture=this.textures[r].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new ht(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:`dispose`})}},St=class extends xt{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Ct=class extends yt{constructor(e=null,n=1,i=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:a},this.magFilter=r,this.minFilter=r,this.wrapR=t,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},wt=class extends yt{constructor(e=null,n=1,i=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:a},this.magFilter=r,this.minFilter=r,this.wrapR=t,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Tt=class{constructor(e=new z(1/0,1/0,1/0),t=new z(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Dt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Dt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Dt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,Dt):Dt.fromBufferAttribute(r,t),Dt.applyMatrix4(e.matrixWorld),this.expandByPoint(Dt);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Ot.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Ot.copy(e.boundingBox)),Ot.applyMatrix4(e.matrixWorld),this.union(Ot)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Dt),Dt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ft),It.subVectors(this.max,Ft),kt.subVectors(e.a,Ft),At.subVectors(e.b,Ft),jt.subVectors(e.c,Ft),Mt.subVectors(At,kt),Nt.subVectors(jt,At),Pt.subVectors(kt,jt);let t=[0,-Mt.z,Mt.y,0,-Nt.z,Nt.y,0,-Pt.z,Pt.y,Mt.z,0,-Mt.x,Nt.z,0,-Nt.x,Pt.z,0,-Pt.x,-Mt.y,Mt.x,0,-Nt.y,Nt.x,0,-Pt.y,Pt.x,0];return!zt(t,kt,At,jt,It)||(t=[1,0,0,0,1,0,0,0,1],!zt(t,kt,At,jt,It))?!1:(Lt.crossVectors(Mt,Nt),t=[Lt.x,Lt.y,Lt.z],zt(t,kt,At,jt,It))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Dt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Dt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Et[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Et[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Et[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Et[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Et[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Et[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Et[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Et[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Et),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Et=[new z,new z,new z,new z,new z,new z,new z,new z],Dt=new z,Ot=new Tt,kt=new z,At=new z,jt=new z,Mt=new z,Nt=new z,Pt=new z,Ft=new z,It=new z,Lt=new z,Rt=new z;function zt(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){Rt.fromArray(e,a);let o=i.x*Math.abs(Rt.x)+i.y*Math.abs(Rt.y)+i.z*Math.abs(Rt.z),s=t.dot(Rt),c=n.dot(Rt),l=r.dot(Rt);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var Bt=new Tt,Vt=new z,Ht=new z,Ut=class{constructor(e=new z,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?Bt.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Vt.subVectors(e,this.center);let t=Vt.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(Vt,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ht.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Vt.copy(e.center).add(Ht)),this.expandByPoint(Vt.copy(e.center).sub(Ht))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Wt=new z,Gt=new z,Kt=new z,qt=new z,Jt=new z,Yt=new z,Xt=new z,Zt=class{constructor(e=new z,t=new z(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Wt)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Wt.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Wt.copy(this.origin).addScaledVector(this.direction,t),Wt.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Gt.copy(e).add(t).multiplyScalar(.5),Kt.copy(t).sub(e).normalize(),qt.copy(this.origin).sub(Gt);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Kt),o=qt.dot(this.direction),s=-qt.dot(Kt),c=qt.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Gt).addScaledVector(Kt,d),f}intersectSphere(e,t){Wt.subVectors(e.center,this.origin);let n=Wt.dot(this.direction),r=Wt.dot(Wt)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Wt)!==null}intersectTriangle(e,t,n,r,i){Jt.subVectors(t,e),Yt.subVectors(n,e),Xt.crossVectors(Jt,Yt);let a=this.direction.dot(Xt),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;qt.subVectors(this.origin,e);let s=o*this.direction.dot(Yt.crossVectors(qt,Yt));if(s<0)return null;let c=o*this.direction.dot(Jt.cross(qt));if(c<0||s+c>a)return null;let l=-o*qt.dot(Xt);return l<0?null:this.at(l/a,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Qt=class e{constructor(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g){e.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,r=1/$t.setFromMatrixColumn(e,0).length(),i=1/$t.setFromMatrixColumn(e,1).length(),a=1/$t.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(tn,e,nn)}lookAt(e,t,n){let r=this.elements;return on.subVectors(e,t),on.lengthSq()===0&&(on.z=1),on.normalize(),rn.crossVectors(n,on),rn.lengthSq()===0&&(Math.abs(n.z)===1?on.x+=1e-4:on.z+=1e-4,on.normalize(),rn.crossVectors(n,on)),rn.normalize(),an.crossVectors(on,rn),r[0]=rn.x,r[4]=an.x,r[8]=on.x,r[1]=rn.y,r[5]=an.y,r[9]=on.y,r[2]=rn.z,r[6]=an.z,r[10]=on.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],ee=r[13],O=r[2],k=r[6],te=r[10],ne=r[14],A=r[3],re=r[7],j=r[11],M=r[15];return i[0]=a*x+o*T+s*O+c*A,i[4]=a*S+o*E+s*k+c*re,i[8]=a*C+o*D+s*te+c*j,i[12]=a*w+o*ee+s*ne+c*M,i[1]=l*x+u*T+d*O+f*A,i[5]=l*S+u*E+d*k+f*re,i[9]=l*C+u*D+d*te+f*j,i[13]=l*w+u*ee+d*ne+f*M,i[2]=p*x+m*T+h*O+g*A,i[6]=p*S+m*E+h*k+g*re,i[10]=p*C+m*D+h*te+g*j,i[14]=p*w+m*ee+h*ne+g*M,i[3]=_*x+v*T+y*O+b*A,i[7]=_*S+v*E+y*k+b*re,i[11]=_*C+v*D+y*te+b*j,i[15]=_*w+v*ee+y*ne+b*M,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15];return p*(+i*s*u-r*c*u-i*o*d+n*c*d+r*o*f-n*s*f)+m*(+t*s*f-t*c*d+i*a*d-r*a*f+r*c*l-i*s*l)+h*(+t*c*u-t*o*f-i*a*u+n*a*f+i*o*l-n*c*l)+g*(-r*o*l-t*s*u+t*o*d+r*a*u-n*a*d+n*s*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=u*h*c-m*d*c+m*s*f-o*h*f-u*s*g+o*d*g,v=p*d*c-l*h*c-p*s*f+a*h*f+l*s*g-a*d*g,y=l*m*c-p*u*c+p*o*f-a*m*f-l*o*g+a*u*g,b=p*u*s-l*m*s-p*o*d+a*m*d+l*o*h-a*u*h,x=t*_+n*v+r*y+i*b;if(x===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let S=1/x;return e[0]=_*S,e[1]=(m*d*i-u*h*i-m*r*f+n*h*f+u*r*g-n*d*g)*S,e[2]=(o*h*i-m*s*i+m*r*c-n*h*c-o*r*g+n*s*g)*S,e[3]=(u*s*i-o*d*i-u*r*c+n*d*c+o*r*f-n*s*f)*S,e[4]=v*S,e[5]=(l*h*i-p*d*i+p*r*f-t*h*f-l*r*g+t*d*g)*S,e[6]=(p*s*i-a*h*i-p*r*c+t*h*c+a*r*g-t*s*g)*S,e[7]=(a*d*i-l*s*i+l*r*c-t*d*c-a*r*f+t*s*f)*S,e[8]=y*S,e[9]=(p*u*i-l*m*i-p*n*f+t*m*f+l*n*g-t*u*g)*S,e[10]=(a*m*i-p*o*i+p*n*c-t*m*c-a*n*g+t*o*g)*S,e[11]=(l*o*i-a*u*i-l*n*c+t*u*c+a*n*f-t*o*f)*S,e[12]=b*S,e[13]=(l*m*r-p*u*r+p*n*d-t*m*d-l*n*h+t*u*h)*S,e[14]=(p*o*r-a*m*r-p*n*s+t*m*s+a*n*h-t*o*h)*S,e[15]=(a*u*r-l*o*r+l*n*s-t*u*s-a*n*d+t*o*d)*S,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements,i=$t.set(r[0],r[1],r[2]).length(),a=$t.set(r[4],r[5],r[6]).length(),o=$t.set(r[8],r[9],r[10]).length();this.determinant()<0&&(i=-i),e.x=r[12],e.y=r[13],e.z=r[14],en.copy(this);let s=1/i,c=1/a,l=1/o;return en.elements[0]*=s,en.elements[1]*=s,en.elements[2]*=s,en.elements[4]*=c,en.elements[5]*=c,en.elements[6]*=c,en.elements[8]*=l,en.elements[9]*=l,en.elements[10]*=l,t.setFromRotationMatrix(en),n.x=i,n.y=a,n.z=o,this}makePerspective(e,t,n,r,i,a,o=Ve,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=Ve,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},$t=new z,en=new Qt,tn=new z(0,0,0),nn=new z(1,1,1),rn=new z,an=new z,on=new z,sn=new Qt,cn=new Ze,ln=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(L(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-L(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(L(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-L(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(L(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-L(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:console.warn(`THREE.Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return sn.makeRotationFromQuaternion(e),this.setFromRotationMatrix(sn,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return cn.setFromEuler(this),this.setFromQuaternion(cn,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ln.DEFAULT_ORDER=`XYZ`;var un=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&(1<<e|0))}},dn=0,fn=new z,pn=new Ze,mn=new Qt,hn=new z,gn=new z,_n=new z,vn=new Ze,yn=new z(1,0,0),bn=new z(0,1,0),xn=new z(0,0,1),Sn={type:`added`},Cn={type:`removed`},wn={type:`childadded`,child:null},Tn={type:`childremoved`,child:null},En=class e extends He{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:dn++}),this.uuid=Ke(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new z,n=new ln,r=new Ze,i=new z(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Qt},normalMatrix:{value:new B}}),this.matrix=new Qt,this.matrixWorld=new Qt,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new un,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return pn.setFromAxisAngle(e,t),this.quaternion.multiply(pn),this}rotateOnWorldAxis(e,t){return pn.setFromAxisAngle(e,t),this.quaternion.premultiply(pn),this}rotateX(e){return this.rotateOnAxis(yn,e)}rotateY(e){return this.rotateOnAxis(bn,e)}rotateZ(e){return this.rotateOnAxis(xn,e)}translateOnAxis(e,t){return fn.copy(e).applyQuaternion(this.quaternion),this.position.add(fn.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(yn,e)}translateY(e){return this.translateOnAxis(bn,e)}translateZ(e){return this.translateOnAxis(xn,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(mn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?hn.copy(e):hn.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),gn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?mn.lookAt(gn,hn,this.up):mn.lookAt(hn,gn,this.up),this.quaternion.setFromRotationMatrix(mn),r&&(mn.extractRotation(r.matrixWorld),pn.setFromRotationMatrix(mn),this.quaternion.premultiply(pn.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(console.error(`THREE.Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Sn),wn.child=e,this.dispatchEvent(wn),wn.child=null):console.error(`THREE.Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Cn),Tn.child=e,this.dispatchEvent(Tn),Tn.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),mn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),mn.multiply(e.parent.matrixWorld)),e.applyMatrix4(mn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Sn),wn.child=e,this.dispatchEvent(wn),wn.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(gn,e,_n),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(gn,vn,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let e=this.children;for(let t=0,n=e.length;t<n;t++)e[t].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==``&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}};En.DEFAULT_UP=new z(0,1,0),En.DEFAULT_MATRIX_AUTO_UPDATE=!0,En.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Dn=new z,On=new z,kn=new z,An=new z,jn=new z,Mn=new z,Nn=new z,Pn=new z,Fn=new z,In=new z,Ln=new bt,Rn=new bt,zn=new bt,Bn=class e{constructor(e=new z,t=new z,n=new z){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Dn.subVectors(e,t),r.cross(Dn);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){Dn.subVectors(r,t),On.subVectors(n,t),kn.subVectors(e,t);let a=Dn.dot(Dn),o=Dn.dot(On),s=Dn.dot(kn),c=On.dot(On),l=On.dot(kn),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,An)!==null&&An.x>=0&&An.y>=0&&An.x+An.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,An)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,An.x),s.addScaledVector(a,An.y),s.addScaledVector(o,An.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return Ln.setScalar(0),Rn.setScalar(0),zn.setScalar(0),Ln.fromBufferAttribute(e,t),Rn.fromBufferAttribute(e,n),zn.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Ln,i.x),a.addScaledVector(Rn,i.y),a.addScaledVector(zn,i.z),a}static isFrontFacing(e,t,n,r){return Dn.subVectors(n,t),On.subVectors(e,t),Dn.cross(On).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Dn.subVectors(this.c,this.b),On.subVectors(this.a,this.b),Dn.cross(On).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;jn.subVectors(r,n),Mn.subVectors(i,n),Pn.subVectors(e,n);let s=jn.dot(Pn),c=Mn.dot(Pn);if(s<=0&&c<=0)return t.copy(n);Fn.subVectors(e,r);let l=jn.dot(Fn),u=Mn.dot(Fn);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(jn,a);In.subVectors(e,i);let f=jn.dot(In),p=Mn.dot(In);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Mn,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return Nn.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(Nn,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(jn,a).addScaledVector(Mn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Vn={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Hn={h:0,s:0,l:0},Un={h:0,s:0,l:0};function Wn(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var H=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Fe){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,V.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=V.workingColorSpace){return this.r=e,this.g=t,this.b=n,V.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=V.workingColorSpace){if(e=qe(e,1),t=L(t,0,1),n=L(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=Wn(i,r,e+1/3),this.g=Wn(i,r,e),this.b=Wn(i,r,e-1/3)}return V.colorSpaceToWorking(this,r),this}setStyle(e,t=Fe){function n(t){t!==void 0&&parseFloat(t)<1&&console.warn(`THREE.Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:console.warn(`THREE.Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);console.warn(`THREE.Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Fe){let n=Vn[e.toLowerCase()];return n===void 0?console.warn(`THREE.Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ut(e.r),this.g=ut(e.g),this.b=ut(e.b),this}copyLinearToSRGB(e){return this.r=dt(e.r),this.g=dt(e.g),this.b=dt(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Fe){return V.workingToColorSpace(Gn.copy(this),e),Math.round(L(Gn.r*255,0,255))*65536+Math.round(L(Gn.g*255,0,255))*256+Math.round(L(Gn.b*255,0,255))}getHexString(e=Fe){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=V.workingColorSpace){V.workingToColorSpace(Gn.copy(this),t);let n=Gn.r,r=Gn.g,i=Gn.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=V.workingColorSpace){return V.workingToColorSpace(Gn.copy(this),t),e.r=Gn.r,e.g=Gn.g,e.b=Gn.b,e}getStyle(e=Fe){V.workingToColorSpace(Gn.copy(this),e);let t=Gn.r,n=Gn.g,r=Gn.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(Hn),this.setHSL(Hn.h+e,Hn.s+t,Hn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Hn),e.getHSL(Un);let n=Je(Hn.h,Un.h,t),r=Je(Hn.s,Un.s,t),i=Je(Hn.l,Un.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Gn=new H;H.NAMES=Vn;var Kn=0,qn=class extends He{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Kn++}),this.uuid=Ke(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new H(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ze,this.stencilZFail=ze,this.stencilZPass=ze,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,this.name!==``&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==204&&(n.blendSrc=this.blendSrc),this.blendDst!==205&&(n.blendDst=this.blendDst),this.blendEquation!==100&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(n.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==`round`&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==`round`&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Jn=class extends qn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new H(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ln,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Yn=new z,Xn=new R,Zn=0,Qn=class{constructor(e,t,n=!1){if(Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Zn++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=Be,this.updateRanges=[],this.gpuType=h,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Xn.fromBufferAttribute(this,t),Xn.applyMatrix3(e),this.setXY(t,Xn.x,Xn.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Yn.fromBufferAttribute(this,t),Yn.applyMatrix3(e),this.setXYZ(t,Yn.x,Yn.y,Yn.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Yn.fromBufferAttribute(this,t),Yn.applyMatrix4(e),this.setXYZ(t,Yn.x,Yn.y,Yn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Yn.fromBufferAttribute(this,t),Yn.applyNormalMatrix(e),this.setXYZ(t,Yn.x,Yn.y,Yn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Yn.fromBufferAttribute(this,t),Yn.transformDirection(e),this.setXYZ(t,Yn.x,Yn.y,Yn.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Ye(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Xe(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ye(t,this.array)),t}setX(e,t){return this.normalized&&(t=Xe(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ye(t,this.array)),t}setY(e,t){return this.normalized&&(t=Xe(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ye(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Xe(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ye(t,this.array)),t}setW(e,t){return this.normalized&&(t=Xe(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Xe(t,this.array),n=Xe(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=Xe(t,this.array),n=Xe(n,this.array),r=Xe(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=Xe(t,this.array),n=Xe(n,this.array),r=Xe(r,this.array),i=Xe(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==``&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}},$n=class extends Qn{constructor(e,t,n){super(new Uint16Array(e),t,n)}},er=class extends Qn{constructor(e,t,n){super(new Uint32Array(e),t,n)}},tr=class extends Qn{constructor(e,t,n){super(new Float32Array(e),t,n)}},nr=0,rr=new Qt,ir=new En,ar=new z,or=new Tt,sr=new Tt,cr=new z,lr=class e extends He{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:nr++}),this.uuid=Ke(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(tt(e)?er:$n)(e,1):e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new B().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return rr.makeRotationFromQuaternion(e),this.applyMatrix4(rr),this}rotateX(e){return rr.makeRotationX(e),this.applyMatrix4(rr),this}rotateY(e){return rr.makeRotationY(e),this.applyMatrix4(rr),this}rotateZ(e){return rr.makeRotationZ(e),this.applyMatrix4(rr),this}translate(e,t,n){return rr.makeTranslation(e,t,n),this.applyMatrix4(rr),this}scale(e,t,n){return rr.makeScale(e,t,n),this.applyMatrix4(rr),this}lookAt(e){return ir.lookAt(e),ir.updateMatrix(),this.applyMatrix4(ir.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ar).negate(),this.translate(ar.x,ar.y,ar.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new tr(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&console.warn(`THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Tt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error(`THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new z(-1/0,-1/0,-1/0),new z(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];or.setFromBufferAttribute(n),this.morphTargetsRelative?(cr.addVectors(this.boundingBox.min,or.min),this.boundingBox.expandByPoint(cr),cr.addVectors(this.boundingBox.max,or.max),this.boundingBox.expandByPoint(cr)):(this.boundingBox.expandByPoint(or.min),this.boundingBox.expandByPoint(or.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error(`THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ut);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error(`THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new z,1/0);return}if(e){let n=this.boundingSphere.center;if(or.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];sr.setFromBufferAttribute(n),this.morphTargetsRelative?(cr.addVectors(or.min,sr.min),or.expandByPoint(cr),cr.addVectors(or.max,sr.max),or.expandByPoint(cr)):(or.expandByPoint(sr.min),or.expandByPoint(sr.max))}or.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)cr.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(cr));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)cr.fromBufferAttribute(a,t),o&&(ar.fromBufferAttribute(e,t),cr.add(ar)),r=Math.max(r,n.distanceToSquared(cr))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error(`THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error(`THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv;this.hasAttribute(`tangent`)===!1&&this.setAttribute(`tangent`,new Qn(new Float32Array(4*n.count),4));let a=this.getAttribute(`tangent`),o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new z,s[e]=new z;let c=new z,l=new z,u=new z,d=new R,f=new R,p=new R,m=new z,h=new z;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new z,y=new z,b=new z,x=new z;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0)n=new Qn(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new z,i=new z,a=new z,o=new z,s=new z,c=new z,l=new z,u=new z;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)cr.fromBufferAttribute(e,t),cr.normalize(),e.setXYZ(t,cr.x,cr.y,cr.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Qn(a,r,i)}if(this.index===null)return console.warn(`THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.type,this.name!==``&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:`dispose`})}},ur=new Qt,dr=new Zt,fr=new Ut,pr=new z,mr=new z,hr=new z,gr=new z,_r=new z,vr=new z,yr=new z,br=new z,xr=class extends En{constructor(e=new lr,t=new Jn){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){vr.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(_r.fromBufferAttribute(s,e),a?vr.addScaledVector(_r,r):vr.addScaledVector(_r.sub(t),r))}t.add(vr)}return t}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),fr.copy(n.boundingSphere),fr.applyMatrix4(i),dr.copy(e.ray).recast(e.near),!(fr.containsPoint(dr.origin)===!1&&(dr.intersectSphere(fr,pr)===null||dr.origin.distanceToSquared(pr)>(e.far-e.near)**2))&&(ur.copy(i).invert(),dr.copy(e.ray).applyMatrix4(ur),(n.boundingBox===null||dr.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,dr)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=Cr(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=Cr(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=Cr(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=Cr(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function Sr(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;br.copy(s),br.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(br);return l<n.near||l>n.far?null:{distance:l,point:br.clone(),object:e}}function Cr(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,mr),e.getVertexPosition(c,hr),e.getVertexPosition(l,gr);let u=Sr(e,t,n,r,mr,hr,gr,yr);if(u){let e=new z;Bn.getBarycoord(yr,mr,hr,gr,e),i&&(u.uv=Bn.getInterpolatedAttribute(i,s,c,l,e,new R)),a&&(u.uv1=Bn.getInterpolatedAttribute(a,s,c,l,e,new R)),o&&(u.normal=Bn.getInterpolatedAttribute(o,s,c,l,e,new z),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new z,materialIndex:0};Bn.getNormal(mr,hr,gr,t.normal),u.face=t,u.barycoord=e}return u}var wr=class e extends lr{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new tr(c,3)),this.setAttribute(`normal`,new tr(l,3)),this.setAttribute(`uv`,new tr(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new z;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function Tr(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone():Array.isArray(i)?t[n][r]=i.slice():t[n][r]=i}}return t}function Er(e){let t={};for(let n=0;n<e.length;n++){let r=Tr(e[n]);for(let e in r)t[e]=r[e]}return t}function Dr(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function Or(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:V.workingColorSpace}var kr={clone:Tr,merge:Er},Ar=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,jr=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Mr=class extends qn{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ar,this.fragmentShader=jr,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Tr(e.uniforms),this.uniformsGroups=Dr(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},Nr=class extends En{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new Qt,this.projectionMatrix=new Qt,this.projectionMatrixInverse=new Qt,this.coordinateSystem=Ve,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Pr=new z,Fr=new R,Ir=new R,Lr=class extends Nr{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Ge*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(We*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ge*2*Math.atan(Math.tan(We*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Pr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Pr.x,Pr.y).multiplyScalar(-e/Pr.z),Pr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Pr.x,Pr.y).multiplyScalar(-e/Pr.z)}getViewSize(e,t){return this.getViewBounds(e,Fr,Ir),t.subVectors(Ir,Fr)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(We*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Rr=-90,zr=1,Br=class extends En{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Lr(Rr,zr,e,t);r.layers=this.layers,this.add(r);let i=new Lr(Rr,zr,e,t);i.layers=this.layers,this.add(i);let a=new Lr(Rr,zr,e,t);a.layers=this.layers,this.add(a);let o=new Lr(Rr,zr,e,t);o.layers=this.layers,this.add(o);let s=new Lr(Rr,zr,e,t);s.layers=this.layers,this.add(s);let c=new Lr(Rr,zr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,i),e.setRenderTarget(n,1,r),e.render(t,a),e.setRenderTarget(n,2,r),e.render(t,o),e.setRenderTarget(n,3,r),e.render(t,s),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},Vr=class extends yt{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Hr=class extends St{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Vr(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new wr(5,5,5),i=new Mr({name:`CubemapFromEquirect`,uniforms:Tr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new xr(r,i),s=t.minFilter;return t.minFilter===1008&&(t.minFilter=o),new Br(1,10,this).update(e,a),t.minFilter=s,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},Ur=class extends En{constructor(){super(),this.isGroup=!0,this.type=`Group`}},Wr={type:`move`},Gr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ur,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ur,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new z,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new z),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ur,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new z,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new z),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Wr)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Ur;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Kr=class extends En{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ln,this.environmentIntensity=1,this.environmentRotation=new ln,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},qr=new z,Jr=new z,Yr=new B,Xr=class{constructor(e=new z(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=qr.subVectors(n,t).cross(Jr.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(qr),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let i=-(e.start.dot(this.normal)+this.constant)/r;return i<0||i>1?null:t.copy(e.start).addScaledVector(n,i)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Yr.getNormalMatrix(e),r=this.coplanarPoint(qr).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Zr=new Ut,Qr=new R(.5,.5),$r=new z,ei=class{constructor(e=new Xr,t=new Xr,n=new Xr,r=new Xr,i=new Xr,a=new Xr){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Ve,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Zr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Zr.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Zr)}intersectsSprite(e){return Zr.center.set(0,0,0),Zr.radius=.7071067811865476+Qr.distanceTo(e.center),Zr.applyMatrix4(e.matrixWorld),this.intersectsSphere(Zr)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if($r.x=r.normal.x>0?e.max.x:e.min.x,$r.y=r.normal.y>0?e.max.y:e.min.y,$r.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint($r)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},ti=class extends yt{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},ni=class extends yt{constructor(e,t,n=m,i,a,o,s=r,c=r,l,u=T,d=1){if(u!==1026&&u!==1027)throw Error(`DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:d},i,a,o,s,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ht(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},ri=class extends yt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},ii=class e extends lr{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new tr(p,3)),this.setAttribute(`normal`,new tr(m,3)),this.setAttribute(`uv`,new tr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},ai=class extends qn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=Ne,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},oi=class extends qn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function si(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function ci(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}var li=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`call to abstract method`)}intervalChanged_(){}},ui=class extends li{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ae,endingEnd:Ae}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case je:i=e,o=2*t-n;break;case Me:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case je:a=e,s=2*n-t;break;case Me:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},di=class extends li{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},fi=class extends li{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},pi=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=si(t,this.TimeBufferType),this.values=si(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:si(e.times,Array),values:si(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new fi(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new di(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ui(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case De:t=this.InterpolantFactoryMethodDiscrete;break;case Oe:t=this.InterpolantFactoryMethodLinear;break;case ke:t=this.InterpolantFactoryMethodSmooth}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return console.warn(`THREE.KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return De;case this.InterpolantFactoryMethodLinear:return Oe;case this.InterpolantFactoryMethodSmooth:return ke}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error(`THREE.KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(console.error(`THREE.KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){console.error(`THREE.KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){console.error(`THREE.KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&ci(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){console.error(`THREE.KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===ke,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};pi.prototype.ValueTypeName=``,pi.prototype.TimeBufferType=Float32Array,pi.prototype.ValueBufferType=Float32Array,pi.prototype.DefaultInterpolation=Oe;var mi=class extends pi{constructor(e,t,n){super(e,t,n)}};mi.prototype.ValueTypeName=`bool`,mi.prototype.ValueBufferType=Array,mi.prototype.DefaultInterpolation=De,mi.prototype.InterpolantFactoryMethodLinear=void 0,mi.prototype.InterpolantFactoryMethodSmooth=void 0;var hi=class extends pi{constructor(e,t,n,r){super(e,t,n,r)}};hi.prototype.ValueTypeName=`color`;var gi=class extends pi{constructor(e,t,n,r){super(e,t,n,r)}};gi.prototype.ValueTypeName=`number`;var _i=class extends li{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Ze.slerpFlat(i,0,a,c-o,a,c,s);return i}},vi=class extends pi{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new _i(this.times,this.values,this.getValueSize(),e)}};vi.prototype.ValueTypeName=`quaternion`,vi.prototype.InterpolantFactoryMethodSmooth=void 0;var yi=class extends pi{constructor(e,t,n){super(e,t,n)}};yi.prototype.ValueTypeName=`string`,yi.prototype.ValueBufferType=Array,yi.prototype.DefaultInterpolation=De,yi.prototype.InterpolantFactoryMethodLinear=void 0,yi.prototype.InterpolantFactoryMethodSmooth=void 0;var bi=class extends pi{constructor(e,t,n,r){super(e,t,n,r)}};bi.prototype.ValueTypeName=`vector`;var xi=class extends Nr{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Si=class extends Lr{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Ci=`\\[\\]\\.:\\/`,wi=RegExp(`[\\[\\]\\.:\\/]`,`g`),Ti=`[^\\[\\]\\.:\\/]`,Ei=`[^`+Ci.replace(`\\.`,``)+`]`,Di=`((?:WC+[\\/:])*)`.replace(`WC`,Ti),Oi=`(WCOD+)?`.replace(`WCOD`,Ei),ki=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,Ti),Ai=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,Ti),ji=RegExp(`^`+Di+Oi+ki+Ai+`$`),Mi=[`material`,`materials`,`bones`,`map`],Ni=class{constructor(e,t,n){let r=n||Pi.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Pi=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(wi,``)}static parseTrackName(e){let t=ji.exec(e);if(t===null)throw Error(`PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Mi.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn(`THREE.PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){console.error(`THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){console.error(`THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){console.error(`THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){console.error(`THREE.PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){console.error(`THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;console.error(`THREE.PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Pi.Composite=Ni,Pi.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Pi.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Pi.prototype.GetterByBindingType=[Pi.prototype._getValue_direct,Pi.prototype._getValue_array,Pi.prototype._getValue_arrayElement,Pi.prototype._getValue_toArray],Pi.prototype.SetterByBindingTypeAndVersioning=[[Pi.prototype._setValue_direct,Pi.prototype._setValue_direct_setNeedsUpdate,Pi.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Pi.prototype._setValue_array,Pi.prototype._setValue_array_setNeedsUpdate,Pi.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Pi.prototype._setValue_arrayElement,Pi.prototype._setValue_arrayElement_setNeedsUpdate,Pi.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Pi.prototype._setValue_fromArray,Pi.prototype._setValue_fromArray_setNeedsUpdate,Pi.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Fi=new Qt,Ii=class{constructor(e,t,n=0,r=1/0){this.ray=new Zt(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new un,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error(`THREE.Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return Fi.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Fi),this}intersectObject(e,t=!0,n=[]){return Ri(e,this,n,t),n.sort(Li),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)Ri(e[r],this,n,t);return n.sort(Li),n}};function Li(e,t){return e.distance-t.distance}function Ri(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)Ri(r[e],t,n,!0)}}function zi(e,t,n,r){let i=Bi(r);switch(n){case S:return e*t;case D:return e*t/i.components*i.byteLength;case ee:return e*t/i.components*i.byteLength;case O:return e*t*2/i.components*i.byteLength;case k:return e*t*2/i.components*i.byteLength;case C:return e*t*3/i.components*i.byteLength;case w:return e*t*4/i.components*i.byteLength;case te:return e*t*4/i.components*i.byteLength;case ne:case A:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case re:case j:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ie:case oe:return Math.max(e,16)*Math.max(t,8)/4;case M:case ae:return Math.max(e,8)*Math.max(t,8)/2;case se:case ce:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case le:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ue:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case de:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case fe:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case pe:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case me:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case he:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case ge:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case _e:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case N:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case ve:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case ye:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case be:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case P:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case xe:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case F:case I:case Se:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Ce:case we:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Te:case Ee:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Bi(e){switch(e){case l:case u:return{byteLength:1,components:1};case f:case d:case g:return{byteLength:2,components:1};case _:case v:return{byteLength:2,components:4};case m:case p:case h:return{byteLength:4,components:1};case b:case x:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`180`}})),typeof window<`u`&&(window.__THREE__?console.warn(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`180`);function Vi(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Hi(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var U={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distanceRGBA_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distanceRGBA_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},W={common:{diffuse:{value:new H(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new B},alphaMap:{value:null},alphaMapTransform:{value:new B},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new B}},envmap:{envMap:{value:null},envMapRotation:{value:new B},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new B}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new B}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new B},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new B},normalScale:{value:new R(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new B},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new B}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new B}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new B}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new H(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new H(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new B},alphaTest:{value:0},uvTransform:{value:new B}},sprite:{diffuse:{value:new H(16777215)},opacity:{value:1},center:{value:new R(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new B},alphaMap:{value:null},alphaMapTransform:{value:new B},alphaTest:{value:0}}},Ui={basic:{uniforms:Er([W.common,W.specularmap,W.envmap,W.aomap,W.lightmap,W.fog]),vertexShader:U.meshbasic_vert,fragmentShader:U.meshbasic_frag},lambert:{uniforms:Er([W.common,W.specularmap,W.envmap,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.fog,W.lights,{emissive:{value:new H(0)}}]),vertexShader:U.meshlambert_vert,fragmentShader:U.meshlambert_frag},phong:{uniforms:Er([W.common,W.specularmap,W.envmap,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.fog,W.lights,{emissive:{value:new H(0)},specular:{value:new H(1118481)},shininess:{value:30}}]),vertexShader:U.meshphong_vert,fragmentShader:U.meshphong_frag},standard:{uniforms:Er([W.common,W.envmap,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.roughnessmap,W.metalnessmap,W.fog,W.lights,{emissive:{value:new H(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:U.meshphysical_vert,fragmentShader:U.meshphysical_frag},toon:{uniforms:Er([W.common,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.gradientmap,W.fog,W.lights,{emissive:{value:new H(0)}}]),vertexShader:U.meshtoon_vert,fragmentShader:U.meshtoon_frag},matcap:{uniforms:Er([W.common,W.bumpmap,W.normalmap,W.displacementmap,W.fog,{matcap:{value:null}}]),vertexShader:U.meshmatcap_vert,fragmentShader:U.meshmatcap_frag},points:{uniforms:Er([W.points,W.fog]),vertexShader:U.points_vert,fragmentShader:U.points_frag},dashed:{uniforms:Er([W.common,W.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:U.linedashed_vert,fragmentShader:U.linedashed_frag},depth:{uniforms:Er([W.common,W.displacementmap]),vertexShader:U.depth_vert,fragmentShader:U.depth_frag},normal:{uniforms:Er([W.common,W.bumpmap,W.normalmap,W.displacementmap,{opacity:{value:1}}]),vertexShader:U.meshnormal_vert,fragmentShader:U.meshnormal_frag},sprite:{uniforms:Er([W.sprite,W.fog]),vertexShader:U.sprite_vert,fragmentShader:U.sprite_frag},background:{uniforms:{uvTransform:{value:new B},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:U.background_vert,fragmentShader:U.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new B}},vertexShader:U.backgroundCube_vert,fragmentShader:U.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:U.cube_vert,fragmentShader:U.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:U.equirect_vert,fragmentShader:U.equirect_frag},distanceRGBA:{uniforms:Er([W.common,W.displacementmap,{referencePosition:{value:new z},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:U.distanceRGBA_vert,fragmentShader:U.distanceRGBA_frag},shadow:{uniforms:Er([W.lights,W.fog,{color:{value:new H(0)},opacity:{value:1}}]),vertexShader:U.shadow_vert,fragmentShader:U.shadow_frag}};Ui.physical={uniforms:Er([Ui.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new B},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new B},clearcoatNormalScale:{value:new R(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new B},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new B},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new B},sheen:{value:0},sheenColor:{value:new H(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new B},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new B},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new B},transmissionSamplerSize:{value:new R},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new B},attenuationDistance:{value:0},attenuationColor:{value:new H(0)},specularColor:{value:new H(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new B},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new B},anisotropyVector:{value:new R},anisotropyMap:{value:null},anisotropyMapTransform:{value:new B}}]),vertexShader:U.meshphysical_vert,fragmentShader:U.meshphysical_frag};var Wi={r:0,b:0,g:0},Gi=new ln,Ki=new Qt;function qi(e,t,n,r,i,a,o){let s=new H(0),c=a===!0?0:1,l,u,d=null,f=0,p=null;function m(e){let r=e.isScene===!0?e.background:null;return r&&r.isTexture&&(r=(e.backgroundBlurriness>0?n:t).get(r)),r}function h(t){let n=!1,i=m(t);i===null?_(s,c):i&&i.isColor&&(_(i,1),n=!0);let a=e.xr.getEnvironmentBlendMode();a===`additive`?r.buffers.color.setClear(0,0,0,1,o):a===`alpha-blend`&&r.buffers.color.setClear(0,0,0,0,o),(e.autoClear||n)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function g(t,n){let r=m(n);r&&(r.isCubeTexture||r.mapping===306)?(u===void 0&&(u=new xr(new wr(1,1,1),new Mr({name:`BackgroundCubeMaterial`,uniforms:Tr(Ui.backgroundCube.uniforms),vertexShader:Ui.backgroundCube.vertexShader,fragmentShader:Ui.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute(`normal`),u.geometry.deleteAttribute(`uv`),u.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),Gi.copy(n.backgroundRotation),Gi.x*=-1,Gi.y*=-1,Gi.z*=-1,r.isCubeTexture&&r.isRenderTargetTexture===!1&&(Gi.y*=-1,Gi.z*=-1),u.material.uniforms.envMap.value=r,u.material.uniforms.flipEnvMap.value=r.isCubeTexture&&r.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Ki.makeRotationFromEuler(Gi)),u.material.toneMapped=V.getTransfer(r.colorSpace)!==Re,(d!==r||f!==r.version||p!==e.toneMapping)&&(u.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null)):r&&r.isTexture&&(l===void 0&&(l=new xr(new ii(2,2),new Mr({name:`BackgroundMaterial`,uniforms:Tr(Ui.background.uniforms),vertexShader:Ui.background.vertexShader,fragmentShader:Ui.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=r,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.toneMapped=V.getTransfer(r.colorSpace)!==Re,r.matrixAutoUpdate===!0&&r.updateMatrix(),l.material.uniforms.uvTransform.value.copy(r.matrix),(d!==r||f!==r.version||p!==e.toneMapping)&&(l.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null))}function _(t,n){t.getRGB(Wi,Or(e)),r.buffers.color.setClear(Wi.r,Wi.g,Wi.b,n,o)}function v(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return s},setClearColor:function(e,t=1){s.set(e),c=t,_(s,c)},getClearAlpha:function(){return c},setClearAlpha:function(e){c=e,_(s,c)},render:h,addToRenderList:g,dispose:v}}function Ji(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n){let i=n.wireframe===!0,a=r[e.id];a===void 0&&(a={},r[e.id]=a);let o=a[t.id];o===void 0&&(o={},a[t.id]=o);let s=o[i];return s===void 0&&(s=f(c()),o[i]=s),s}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){w();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e.id]}function C(e){for(let t in r){let n=r[t];if(n[e.id]===void 0)continue;let i=n[e.id];for(let e in i)u(i[e].object),delete i[e];delete n[e.id]}}function w(){T(),o=!0,a!==i&&(a=i,l(a.object))}function T(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:w,resetDefaultState:T,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Yi(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}function c(e,i,a,s){if(a===0)return;let c=t.get(`WEBGL_multi_draw`);if(c===null)for(let t=0;t<e.length;t++)o(e[t],i[t],s[t]);else{c.multiDrawArraysInstancedWEBGL(r,e,0,i,0,s,0,a);let t=0;for(let e=0;e<a;e++)t+=i[e]*s[e];n.update(t,r,1)}}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=c}function Xi(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(console.warn(`THREE.WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=m>0,S=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,vertexTextures:x,maxSamples:S}}function Zi(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Xr,s=new B,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}function Qi(e){let t=new WeakMap;function n(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function r(r){if(r&&r.isTexture){let a=r.mapping;if(a===303||a===304){if(t.has(r)){let e=t.get(r).texture;return n(e,r.mapping)}{let a=r.image;if(a&&a.height>0){let o=new Hr(a.height);return o.fromEquirectangularTexture(e,r),t.set(r,o),r.addEventListener(`dispose`,i),n(o.texture,r.mapping)}return null}}}return r}function i(e){let n=e.target;n.removeEventListener(`dispose`,i);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function a(){t=new WeakMap}return{get:r,dispose:a}}var $i=4,ea=[.125,.215,.35,.446,.526,.582],ta=20,na=new xi,ra=new H,ia=null,aa=0,oa=0,sa=!1,ca=(1+Math.sqrt(5))/2,la=1/ca,ua=[new z(-ca,la,0),new z(ca,la,0),new z(-la,0,ca),new z(la,0,ca),new z(0,ca,-la),new z(0,ca,la),new z(-1,1,-1),new z(1,1,-1),new z(-1,1,1),new z(1,1,1)],da=new z,fa=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=da}=i;ia=this._renderer.getRenderTarget(),aa=this._renderer.getActiveCubeFace(),oa=this._renderer.getActiveMipmapLevel(),sa=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=va(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=_a(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(ia,aa,oa),this._renderer.xr.enabled=sa,e.scissorTest=!1,ha(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ia=this._renderer.getRenderTarget(),aa=this._renderer.getActiveCubeFace(),oa=this._renderer.getActiveMipmapLevel(),sa=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:o,minFilter:o,generateMipmaps:!1,type:g,format:w,colorSpace:Ie,depthBuffer:!1},r=ma(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ma(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=pa(r)),this._blurMaterial=ga(r,e,t)}return r}_compileMaterial(e){let t=new xr(this._lodPlanes[0],e);this._renderer.compile(t,na)}_sceneToCubeUV(e,t,n,r,i){let a=new Lr(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(ra),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null));let d=new Jn({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1}),f=new xr(new wr,d),p=!1,m=e.background;m?m.isColor&&(d.color.copy(m),e.background=null,p=!0):(d.color.copy(ra),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;ha(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(f,a),c.render(e,a)}f.geometry.dispose(),f.material.dispose(),c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=va()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=_a());let i=r?this._cubemapMaterial:this._equirectMaterial,a=new xr(this._lodPlanes[0],i),o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;ha(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,na)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let t=1;t<r;t++){let n=Math.sqrt(this._sigmas[t]*this._sigmas[t]-this._sigmas[t-1]*this._sigmas[t-1]),i=ua[(r-t-1)%ua.length];this._blur(e,t-1,t,n,i)}t.autoClear=n}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&console.error(`blur direction must be either latitudinal or longitudinal!`);let l=new xr(this._lodPlanes[r],c),u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/39,p=i/f,m=isFinite(i)?1+Math.floor(3*p):ta;m>ta&&console.warn(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ta}`);let h=[],g=0;for(let e=0;e<ta;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];ha(t,3*v*(r>_-$i?r-_+$i:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,na)}};function pa(e){let t=[],n=[],r=[],i=e,a=e-$i+1+ea.length;for(let o=0;o<a;o++){let a=2**i;n.push(a);let s=1/a;o>e-$i?s=ea[o-e+$i-1]:o===0&&(s=0),r.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new lr;h.setAttribute(`position`,new Qn(f,3)),h.setAttribute(`uv`,new Qn(p,2)),h.setAttribute(`faceIndex`,new Qn(m,1)),t.push(h),i>$i&&i--}return{lodPlanes:t,sizeLods:n,sigmas:r}}function ma(e,t,n){let r=new St(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function ha(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function ga(e,t,n){let r=new Float32Array(ta),i=new z(0,1,0);return new Mr({name:`SphericalGaussianBlur`,defines:{n:ta,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:ya(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function _a(){return new Mr({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:ya(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function va(){return new Mr({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ya(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function ya(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function ba(e){let t=new WeakMap,n=null;function r(r){if(r&&r.isTexture){let o=r.mapping,s=o===303||o===304,c=o===301||o===302;if(s||c){let o=t.get(r),l=o===void 0?0:o.texture.pmremVersion;if(r.isRenderTargetTexture&&r.pmremVersion!==l)return n===null&&(n=new fa(e)),o=s?n.fromEquirectangular(r,o):n.fromCubemap(r,o),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),o.texture;if(o!==void 0)return o.texture;{let l=r.image;return s&&l&&l.height>0||c&&l&&i(l)?(n===null&&(n=new fa(e)),o=s?n.fromEquirectangular(r):n.fromCubemap(r),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),r.addEventListener(`dispose`,a),o.texture):null}}}return r}function i(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function a(e){let n=e.target;n.removeEventListener(`dispose`,a);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function o(){t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:o}}function xa(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r;switch(n){case`WEBGL_depth_texture`:r=e.getExtension(`WEBGL_depth_texture`)||e.getExtension(`MOZ_WEBGL_depth_texture`)||e.getExtension(`WEBKIT_WEBGL_depth_texture`);break;case`EXT_texture_filter_anisotropic`:r=e.getExtension(`EXT_texture_filter_anisotropic`)||e.getExtension(`MOZ_EXT_texture_filter_anisotropic`)||e.getExtension(`WEBKIT_EXT_texture_filter_anisotropic`);break;case`WEBGL_compressed_texture_s3tc`:r=e.getExtension(`WEBGL_compressed_texture_s3tc`)||e.getExtension(`MOZ_WEBGL_compressed_texture_s3tc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_s3tc`);break;case`WEBGL_compressed_texture_pvrtc`:r=e.getExtension(`WEBGL_compressed_texture_pvrtc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`);break;default:r=e.getExtension(n)}return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&at(`THREE.WebGLRenderer: `+e+` extension not supported.`),t}}}function Sa(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else if(i!==void 0){let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}else return;let s=new(tt(n)?er:$n)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function Ca(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}function d(e,i,s,c){if(s===0)return;let u=t.get(`WEBGL_multi_draw`);if(u===null)for(let t=0;t<e.length;t++)l(e[t]/o,i[t],c[t]);else{u.multiDrawElementsInstancedWEBGL(r,i,0,a,e,0,c,0,s);let t=0;for(let e=0;e<s;e++)t+=i[e]*c[e];n.update(t,r,1)}}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function wa(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:console.error(`THREE.WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Ta(e,t,n){let r=new WeakMap,i=new bt;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let g=new Float32Array(p*m*4*u),_=new Ct(g,p,m,u);_.type=h,_.needsUpdate=!0;let v=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*v;e===!0&&(i.fromBufferAttribute(r,t),g[d+s+0]=i.x,g[d+s+1]=i.y,g[d+s+2]=i.z,g[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),g[d+s+4]=i.x,g[d+s+5]=i.y,g[d+s+6]=i.z,g[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),g[d+s+8]=i.x,g[d+s+9]=i.y,g[d+s+10]=i.z,g[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:_,size:new R(p,m)},r.set(o,d);function y(){_.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Ea(e,t,n,r){let i=new WeakMap;function a(a){let o=r.render.frame,c=a.geometry,l=t.get(a,c);if(i.get(l)!==o&&(t.update(l),i.set(l,o)),a.isInstancedMesh&&(a.hasEventListener(`dispose`,s)===!1&&a.addEventListener(`dispose`,s),i.get(a)!==o&&(n.update(a.instanceMatrix,e.ARRAY_BUFFER),a.instanceColor!==null&&n.update(a.instanceColor,e.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let e=a.skeleton;i.get(e)!==o&&(e.update(),i.set(e,o))}return l}function o(){i=new WeakMap}function s(e){let t=e.target;t.removeEventListener(`dispose`,s),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:a,dispose:o}}var Da=new yt,Oa=new ni(1,1),ka=new Ct,Aa=new wt,ja=new Vr,Ma=[],Na=[],Pa=new Float32Array(16),Fa=new Float32Array(9),Ia=new Float32Array(4);function La(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Ma[i];if(a===void 0&&(a=new Float32Array(i),Ma[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Ra(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function za(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Ba(e,t){let n=Na[t];n===void 0&&(n=new Int32Array(t),Na[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Va(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Ha(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ra(n,t))return;e.uniform2fv(this.addr,t),za(n,t)}}function Ua(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Ra(n,t))return;e.uniform3fv(this.addr,t),za(n,t)}}function Wa(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ra(n,t))return;e.uniform4fv(this.addr,t),za(n,t)}}function Ga(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Ra(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),za(n,t)}else{if(Ra(n,r))return;Ia.set(r),e.uniformMatrix2fv(this.addr,!1,Ia),za(n,r)}}function Ka(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Ra(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),za(n,t)}else{if(Ra(n,r))return;Fa.set(r),e.uniformMatrix3fv(this.addr,!1,Fa),za(n,r)}}function qa(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Ra(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),za(n,t)}else{if(Ra(n,r))return;Pa.set(r),e.uniformMatrix4fv(this.addr,!1,Pa),za(n,r)}}function Ja(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Ya(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ra(n,t))return;e.uniform2iv(this.addr,t),za(n,t)}}function Xa(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Ra(n,t))return;e.uniform3iv(this.addr,t),za(n,t)}}function Za(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ra(n,t))return;e.uniform4iv(this.addr,t),za(n,t)}}function Qa(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function $a(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ra(n,t))return;e.uniform2uiv(this.addr,t),za(n,t)}}function eo(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Ra(n,t))return;e.uniform3uiv(this.addr,t),za(n,t)}}function to(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ra(n,t))return;e.uniform4uiv(this.addr,t),za(n,t)}}function no(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(Oa.compareFunction=515,a=Oa):a=Da,n.setTexture2D(t||a,i)}function ro(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Aa,i)}function io(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||ja,i)}function ao(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||ka,i)}function oo(e){switch(e){case 5126:return Va;case 35664:return Ha;case 35665:return Ua;case 35666:return Wa;case 35674:return Ga;case 35675:return Ka;case 35676:return qa;case 5124:case 35670:return Ja;case 35667:case 35671:return Ya;case 35668:case 35672:return Xa;case 35669:case 35673:return Za;case 5125:return Qa;case 36294:return $a;case 36295:return eo;case 36296:return to;case 35678:case 36198:case 36298:case 36306:case 35682:return no;case 35679:case 36299:case 36307:return ro;case 35680:case 36300:case 36308:case 36293:return io;case 36289:case 36303:case 36311:case 36292:return ao}}function so(e,t){e.uniform1fv(this.addr,t)}function co(e,t){let n=La(t,this.size,2);e.uniform2fv(this.addr,n)}function lo(e,t){let n=La(t,this.size,3);e.uniform3fv(this.addr,n)}function uo(e,t){let n=La(t,this.size,4);e.uniform4fv(this.addr,n)}function fo(e,t){let n=La(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function po(e,t){let n=La(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function mo(e,t){let n=La(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function ho(e,t){e.uniform1iv(this.addr,t)}function go(e,t){e.uniform2iv(this.addr,t)}function _o(e,t){e.uniform3iv(this.addr,t)}function vo(e,t){e.uniform4iv(this.addr,t)}function yo(e,t){e.uniform1uiv(this.addr,t)}function bo(e,t){e.uniform2uiv(this.addr,t)}function xo(e,t){e.uniform3uiv(this.addr,t)}function So(e,t){e.uniform4uiv(this.addr,t)}function Co(e,t,n){let r=this.cache,i=t.length,a=Ba(n,i);Ra(r,a)||(e.uniform1iv(this.addr,a),za(r,a));for(let e=0;e!==i;++e)n.setTexture2D(t[e]||Da,a[e])}function wo(e,t,n){let r=this.cache,i=t.length,a=Ba(n,i);Ra(r,a)||(e.uniform1iv(this.addr,a),za(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Aa,a[e])}function To(e,t,n){let r=this.cache,i=t.length,a=Ba(n,i);Ra(r,a)||(e.uniform1iv(this.addr,a),za(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||ja,a[e])}function Eo(e,t,n){let r=this.cache,i=t.length,a=Ba(n,i);Ra(r,a)||(e.uniform1iv(this.addr,a),za(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||ka,a[e])}function Do(e){switch(e){case 5126:return so;case 35664:return co;case 35665:return lo;case 35666:return uo;case 35674:return fo;case 35675:return po;case 35676:return mo;case 5124:case 35670:return ho;case 35667:case 35671:return go;case 35668:case 35672:return _o;case 35669:case 35673:return vo;case 5125:return yo;case 36294:return bo;case 36295:return xo;case 36296:return So;case 35678:case 36198:case 36298:case 36306:case 35682:return Co;case 35679:case 36299:case 36307:return wo;case 35680:case 36300:case 36308:case 36293:return To;case 36289:case 36303:case 36311:case 36292:return Eo}}var Oo=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=oo(t.type)}},ko=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Do(t.type)}},Ao=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},jo=/(\w+)(\])?(\[|\.)?/g;function Mo(e,t){e.seq.push(t),e.map[t.id]=t}function No(e,t,n){let r=e.name,i=r.length;for(jo.lastIndex=0;;){let a=jo.exec(r),o=jo.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Mo(n,l===void 0?new Oo(s,e,t):new ko(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Ao(s),Mo(n,e)),n=e}}}var Po=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);No(n,e.getUniformLocation(t,n.name),this)}}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Fo(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Io=37297,Lo=0;function Ro(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var zo=new B;function Bo(e){V._getMatrix(zo,V.workingColorSpace,e);let t=`mat3( ${zo.elements.map(e=>e.toFixed(4))} )`;switch(V.getTransfer(e)){case Le:return[t,`LinearTransferOETF`];case Re:return[t,`sRGBTransferOETF`];default:return console.warn(`THREE.WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Vo(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Ro(e.getShaderSource(t),r)}return i}function Ho(e,t){let n=Bo(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}function Uo(e,t){let n;switch(t){case 1:n=`Linear`;break;case 2:n=`Reinhard`;break;case 3:n=`Cineon`;break;case 4:n=`ACESFilmic`;break;case 6:n=`AgX`;break;case 7:n=`Neutral`;break;case 5:n=`Custom`;break;default:console.warn(`THREE.WebGLProgram: Unsupported toneMapping:`,t),n=`Linear`}return`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Wo=new z;function Go(){return V.getLuminanceCoefficients(Wo),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Wo.x.toFixed(4)}, ${Wo.y.toFixed(4)}, ${Wo.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Ko(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Yo).join(`
`)}function qo(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Jo(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Yo(e){return e!==``}function Xo(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Zo(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Qo=/^[ \t]*#include +<([\w\d./]+)>/gm;function $o(e){return e.replace(Qo,ts)}var es=new Map;function ts(e,t){let n=U[t];if(n===void 0){let e=es.get(t);if(e!==void 0)n=U[e],console.warn(`THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return $o(n)}var ns=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function rs(e){return e.replace(ns,is)}function is(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function as(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}function os(e){let t=`SHADOWMAP_TYPE_BASIC`;return e.shadowMapType===1?t=`SHADOWMAP_TYPE_PCF`:e.shadowMapType===2?t=`SHADOWMAP_TYPE_PCF_SOFT`:e.shadowMapType===3&&(t=`SHADOWMAP_TYPE_VSM`),t}function ss(e){let t=`ENVMAP_TYPE_CUBE`;if(e.envMap)switch(e.envMapMode){case 301:case 302:t=`ENVMAP_TYPE_CUBE`;break;case 306:t=`ENVMAP_TYPE_CUBE_UV`}return t}function cs(e){let t=`ENVMAP_MODE_REFLECTION`;if(e.envMap)switch(e.envMapMode){case 302:t=`ENVMAP_MODE_REFRACTION`}return t}function ls(e){let t=`ENVMAP_BLENDING_NONE`;if(e.envMap)switch(e.combine){case 0:t=`ENVMAP_BLENDING_MULTIPLY`;break;case 1:t=`ENVMAP_BLENDING_MIX`;break;case 2:t=`ENVMAP_BLENDING_ADD`}return t}function us(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function ds(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=os(n),l=ss(n),u=cs(n),d=ls(n),f=us(n),p=Ko(n),m=qo(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Yo).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Yo).join(`
`),_.length>0&&(_+=`
`)):(g=[as(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Yo).join(`
`),_=[as(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor||n.batchingColor?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:U.tonemapping_pars_fragment,n.toneMapping===0?``:Uo(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,U.colorspace_pars_fragment,Ho(`linearToOutputTexel`,n.outputColorSpace),Go(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Yo).join(`
`)),o=$o(o),o=Xo(o,n),o=Zo(o,n),s=$o(s),s=Xo(s,n),s=Zo(s,n),o=rs(o),s=rs(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Fo(i,i.VERTEX_SHADER,y),S=Fo(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=Vo(i,x,`vertex`),n=Vo(i,S,`fragment`);console.error(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):console.warn(`THREE.WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new Po(i,h),T=Jo(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,Io)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Lo++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var fs=0,ps=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new ms(e),t.set(e,n)),n}},ms=class{constructor(e){this.id=fs++,this.code=e,this.usedTimes=0}};function hs(e,t,n,r,i,a,o){let s=new un,c=new ps,l=new Set,u=[],d=i.logarithmicDepthBuffer,f=i.vertexTextures,p=i.precision,m={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distanceRGBA`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function h(e){return l.add(e),e===0?`uv`:`uv${e}`}function g(a,s,u,g,_){let v=g.fog,y=_.geometry,b=a.isMeshStandardMaterial?g.environment:null,x=(a.isMeshStandardMaterial?n:t).get(a.envMap||b),S=x&&x.mapping===306?x.image.height:null,C=m[a.type];a.precision!==null&&(p=i.getMaxPrecision(a.precision),p!==a.precision&&console.warn(`THREE.WebGLProgram.getParameters:`,a.precision,`not supported, using`,p,`instead.`));let w=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,T=w===void 0?0:w.length,E=0;y.morphAttributes.position!==void 0&&(E=1),y.morphAttributes.normal!==void 0&&(E=2),y.morphAttributes.color!==void 0&&(E=3);let D,ee,O,k;if(C){let e=Ui[C];D=e.vertexShader,ee=e.fragmentShader}else D=a.vertexShader,ee=a.fragmentShader,c.update(a),O=c.getVertexShaderID(a),k=c.getFragmentShaderID(a);let te=e.getRenderTarget(),ne=e.state.buffers.depth.getReversed(),A=_.isInstancedMesh===!0,re=_.isBatchedMesh===!0,j=!!a.map,M=!!a.matcap,ie=!!x,ae=!!a.aoMap,oe=!!a.lightMap,se=!!a.bumpMap,ce=!!a.normalMap,le=!!a.displacementMap,ue=!!a.emissiveMap,de=!!a.metalnessMap,fe=!!a.roughnessMap,pe=a.anisotropy>0,me=a.clearcoat>0,he=a.dispersion>0,ge=a.iridescence>0,_e=a.sheen>0,N=a.transmission>0,ve=pe&&!!a.anisotropyMap,ye=me&&!!a.clearcoatMap,be=me&&!!a.clearcoatNormalMap,P=me&&!!a.clearcoatRoughnessMap,xe=ge&&!!a.iridescenceMap,F=ge&&!!a.iridescenceThicknessMap,I=_e&&!!a.sheenColorMap,Se=_e&&!!a.sheenRoughnessMap,Ce=!!a.specularMap,we=!!a.specularColorMap,Te=!!a.specularIntensityMap,Ee=N&&!!a.transmissionMap,De=N&&!!a.thicknessMap,Oe=!!a.gradientMap,ke=!!a.alphaMap,Ae=a.alphaTest>0,je=!!a.alphaHash,Me=!!a.extensions,Ne=0;a.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(Ne=e.toneMapping);let Pe={shaderID:C,shaderType:a.type,shaderName:a.name,vertexShader:D,fragmentShader:ee,defines:a.defines,customVertexShaderID:O,customFragmentShaderID:k,isRawShaderMaterial:a.isRawShaderMaterial===!0,glslVersion:a.glslVersion,precision:p,batching:re,batchingColor:re&&_._colorsTexture!==null,instancing:A,instancingColor:A&&_.instanceColor!==null,instancingMorph:A&&_.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:te===null?e.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:Ie,alphaToCoverage:!!a.alphaToCoverage,map:j,matcap:M,envMap:ie,envMapMode:ie&&x.mapping,envMapCubeUVHeight:S,aoMap:ae,lightMap:oe,bumpMap:se,normalMap:ce,displacementMap:f&&le,emissiveMap:ue,normalMapObjectSpace:ce&&a.normalMapType===1,normalMapTangentSpace:ce&&a.normalMapType===0,metalnessMap:de,roughnessMap:fe,anisotropy:pe,anisotropyMap:ve,clearcoat:me,clearcoatMap:ye,clearcoatNormalMap:be,clearcoatRoughnessMap:P,dispersion:he,iridescence:ge,iridescenceMap:xe,iridescenceThicknessMap:F,sheen:_e,sheenColorMap:I,sheenRoughnessMap:Se,specularMap:Ce,specularColorMap:we,specularIntensityMap:Te,transmission:N,transmissionMap:Ee,thicknessMap:De,gradientMap:Oe,opaque:a.transparent===!1&&a.blending===1&&a.alphaToCoverage===!1,alphaMap:ke,alphaTest:Ae,alphaHash:je,combine:a.combine,mapUv:j&&h(a.map.channel),aoMapUv:ae&&h(a.aoMap.channel),lightMapUv:oe&&h(a.lightMap.channel),bumpMapUv:se&&h(a.bumpMap.channel),normalMapUv:ce&&h(a.normalMap.channel),displacementMapUv:le&&h(a.displacementMap.channel),emissiveMapUv:ue&&h(a.emissiveMap.channel),metalnessMapUv:de&&h(a.metalnessMap.channel),roughnessMapUv:fe&&h(a.roughnessMap.channel),anisotropyMapUv:ve&&h(a.anisotropyMap.channel),clearcoatMapUv:ye&&h(a.clearcoatMap.channel),clearcoatNormalMapUv:be&&h(a.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:P&&h(a.clearcoatRoughnessMap.channel),iridescenceMapUv:xe&&h(a.iridescenceMap.channel),iridescenceThicknessMapUv:F&&h(a.iridescenceThicknessMap.channel),sheenColorMapUv:I&&h(a.sheenColorMap.channel),sheenRoughnessMapUv:Se&&h(a.sheenRoughnessMap.channel),specularMapUv:Ce&&h(a.specularMap.channel),specularColorMapUv:we&&h(a.specularColorMap.channel),specularIntensityMapUv:Te&&h(a.specularIntensityMap.channel),transmissionMapUv:Ee&&h(a.transmissionMap.channel),thicknessMapUv:De&&h(a.thicknessMap.channel),alphaMapUv:ke&&h(a.alphaMap.channel),vertexTangents:!!y.attributes.tangent&&(ce||pe),vertexColors:a.vertexColors,vertexAlphas:a.vertexColors===!0&&!!y.attributes.color&&y.attributes.color.itemSize===4,pointsUvs:_.isPoints===!0&&!!y.attributes.uv&&(j||ke),fog:!!v,useFog:a.fog===!0,fogExp2:!!v&&v.isFogExp2,flatShading:a.flatShading===!0&&a.wireframe===!1,sizeAttenuation:a.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:ne,skinning:_.isSkinnedMesh===!0,morphTargets:y.morphAttributes.position!==void 0,morphNormals:y.morphAttributes.normal!==void 0,morphColors:y.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numDirLights:s.directional.length,numPointLights:s.point.length,numSpotLights:s.spot.length,numSpotLightMaps:s.spotLightMap.length,numRectAreaLights:s.rectArea.length,numHemiLights:s.hemi.length,numDirLightShadows:s.directionalShadowMap.length,numPointLightShadows:s.pointShadowMap.length,numSpotLightShadows:s.spotShadowMap.length,numSpotLightShadowsWithMaps:s.numSpotLightShadowsWithMaps,numLightProbes:s.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:a.dithering,shadowMapEnabled:e.shadowMap.enabled&&u.length>0,shadowMapType:e.shadowMap.type,toneMapping:Ne,decodeVideoTexture:j&&a.map.isVideoTexture===!0&&V.getTransfer(a.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ue&&a.emissiveMap.isVideoTexture===!0&&V.getTransfer(a.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:a.premultipliedAlpha,doubleSided:a.side===2,flipSided:a.side===1,useDepthPacking:a.depthPacking>=0,depthPacking:a.depthPacking||0,index0AttributeName:a.index0AttributeName,extensionClipCullDistance:Me&&a.extensions.clipCullDistance===!0&&r.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Me&&a.extensions.multiDraw===!0||re)&&r.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:r.has(`KHR_parallel_shader_compile`),customProgramCacheKey:a.customProgramCacheKey()};return Pe.vertexUv1s=l.has(1),Pe.vertexUv2s=l.has(2),Pe.vertexUv3s=l.has(3),l.clear(),Pe}function _(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(v(n,t),y(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function v(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function y(e,t){s.disableAll(),t.supportsVertexTextures&&s.enable(0),t.instancing&&s.enable(1),t.instancingColor&&s.enable(2),t.instancingMorph&&s.enable(3),t.matcap&&s.enable(4),t.envMap&&s.enable(5),t.normalMapObjectSpace&&s.enable(6),t.normalMapTangentSpace&&s.enable(7),t.clearcoat&&s.enable(8),t.iridescence&&s.enable(9),t.alphaTest&&s.enable(10),t.vertexColors&&s.enable(11),t.vertexAlphas&&s.enable(12),t.vertexUv1s&&s.enable(13),t.vertexUv2s&&s.enable(14),t.vertexUv3s&&s.enable(15),t.vertexTangents&&s.enable(16),t.anisotropy&&s.enable(17),t.alphaHash&&s.enable(18),t.batching&&s.enable(19),t.dispersion&&s.enable(20),t.batchingColor&&s.enable(21),t.gradientMap&&s.enable(22),e.push(s.mask),s.disableAll(),t.fog&&s.enable(0),t.useFog&&s.enable(1),t.flatShading&&s.enable(2),t.logarithmicDepthBuffer&&s.enable(3),t.reversedDepthBuffer&&s.enable(4),t.skinning&&s.enable(5),t.morphTargets&&s.enable(6),t.morphNormals&&s.enable(7),t.morphColors&&s.enable(8),t.premultipliedAlpha&&s.enable(9),t.shadowMapEnabled&&s.enable(10),t.doubleSided&&s.enable(11),t.flipSided&&s.enable(12),t.useDepthPacking&&s.enable(13),t.dithering&&s.enable(14),t.transmission&&s.enable(15),t.sheen&&s.enable(16),t.opaque&&s.enable(17),t.pointsUvs&&s.enable(18),t.decodeVideoTexture&&s.enable(19),t.decodeVideoTextureEmissive&&s.enable(20),t.alphaToCoverage&&s.enable(21),e.push(s.mask)}function b(e){let t=m[e.type],n;if(t){let e=Ui[t];n=kr.clone(e.uniforms)}else n=e.uniforms;return n}function x(t,n){let r;for(let e=0,t=u.length;e<t;e++){let t=u[e];if(t.cacheKey===n){r=t,++r.usedTimes;break}}return r===void 0&&(r=new ds(e,n,t,a),u.push(r)),r}function S(e){if(--e.usedTimes===0){let t=u.indexOf(e);u[t]=u[u.length-1],u.pop(),e.destroy()}}function C(e){c.remove(e)}function w(){c.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:b,acquireProgram:x,releaseProgram:S,releaseShaderCache:C,programs:u,dispose:w}}function gs(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function _s(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.z===t.z?e.id-t.id:e.z-t.z:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function vs(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function ys(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(n,r,i,a,o,s){let c=e[t];return c===void 0?(c={id:n.id,object:n,geometry:r,material:i,groupOrder:a,renderOrder:n.renderOrder,z:o,group:s},e[t]=c):(c.id=n.id,c.object=n,c.geometry=r,c.material=i,c.groupOrder=a,c.renderOrder=n.renderOrder,c.z=o,c.group=s),t++,c}function s(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function c(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function l(e,t){n.length>1&&n.sort(e||_s),r.length>1&&r.sort(t||vs),i.length>1&&i.sort(t||vs)}function u(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:s,unshift:c,finish:u,sort:l}}function bs(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new ys,e.set(t,[i])):n>=r.length?(i=new ys,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function xs(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new z,color:new H};break;case`SpotLight`:n={position:new z,direction:new z,color:new H,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new z,color:new H,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new z,skyColor:new H,groundColor:new H};break;case`RectAreaLight`:n={color:new H,position:new z,halfWidth:new z,halfHeight:new z}}return e[t.id]=n,n}}}function Ss(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new R};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new R};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new R,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Cs=0;function ws(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Ts(e){let t=new xs,n=Ss(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new z);let i=new z,a=new Qt,o=new Qt;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(ws);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=W.LTC_FLOAT_1,r.rectAreaLTC2=W.LTC_FLOAT_2):(r.rectAreaLTC1=W.LTC_HALF_1,r.rectAreaLTC2=W.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=Cs++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function Es(e){let t=new Ts(e),n=[],r=[];function i(e){l.camera=e,n.length=0,r.length=0}function a(e){n.push(e)}function o(e){r.push(e)}function s(){t.setup(n)}function c(e){t.setupView(n,e)}let l={lightsArray:n,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:s,setupLightsView:c,pushLight:a,pushShadow:o}}function Ds(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Es(e),t.set(n,[a])):r>=i.length?(a=new Es(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Os=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ks=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function As(e,t,n){let i=new ei,a=new R,o=new R,s=new bt,c=new ai({depthPacking:Pe}),l=new oi,u={},d=n.maxTextureSize,f={0:1,1:0,2:2},p=new Mr({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new R},radius:{value:4}},vertexShader:Os,fragmentShader:ks}),m=p.clone();m.defines.HORIZONTAL_PASS=1;let h=new lr;h.setAttribute(`position`,new Qn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let g=new xr(h,p),_=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let v=this.type;this.render=function(t,n,c){if(_.enabled===!1||_.autoUpdate===!1&&_.needsUpdate===!1||t.length===0)return;let l=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.state;p.setBlending(0),p.buffers.depth.getReversed()===!0?p.buffers.color.setClear(0,0,0,0):p.buffers.color.setClear(1,1,1,1),p.buffers.depth.setTest(!0),p.setScissorTest(!1);let m=v!==3&&this.type===3,h=v===3&&this.type!==3;for(let l=0,u=t.length;l<u;l++){let u=t[l],f=u.shadow;if(f===void 0){console.warn(`THREE.WebGLShadowMap:`,u,`has no shadow.`);continue}if(f.autoUpdate===!1&&f.needsUpdate===!1)continue;a.copy(f.mapSize);let g=f.getFrameExtents();if(a.multiply(g),o.copy(f.mapSize),(a.x>d||a.y>d)&&(a.x>d&&(o.x=Math.floor(d/g.x),a.x=o.x*g.x,f.mapSize.x=o.x),a.y>d&&(o.y=Math.floor(d/g.y),a.y=o.y*g.y,f.mapSize.y=o.y)),f.map===null||m===!0||h===!0){let e=this.type===3?{}:{minFilter:r,magFilter:r};f.map!==null&&f.map.dispose(),f.map=new St(a.x,a.y,e),f.map.texture.name=u.name+`.shadowMap`,f.camera.updateProjectionMatrix()}e.setRenderTarget(f.map),e.clear();let _=f.getViewportCount();for(let e=0;e<_;e++){let t=f.getViewport(e);s.set(o.x*t.x,o.y*t.y,o.x*t.z,o.y*t.w),p.viewport(s),f.updateMatrices(u,e),i=f.getFrustum(),x(n,c,f.camera,u,this.type)}f.isPointLightShadow!==!0&&this.type===3&&y(f,c),f.needsUpdate=!1}v=this.type,_.needsUpdate=!1,e.setRenderTarget(l,u,f)};function y(n,r){let i=t.update(g);p.defines.VSM_SAMPLES!==n.blurSamples&&(p.defines.VSM_SAMPLES=n.blurSamples,m.defines.VSM_SAMPLES=n.blurSamples,p.needsUpdate=!0,m.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new St(a.x,a.y)),p.uniforms.shadow_pass.value=n.map.texture,p.uniforms.resolution.value=n.mapSize,p.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,i,p,g,null),m.uniforms.shadow_pass.value=n.mapPass.texture,m.uniforms.resolution.value=n.mapSize,m.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,i,m,g,null)}function b(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?l:c,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=u[e];r===void 0&&(r={},u[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,S)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?f[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function x(n,r,a,o,s){if(n.visible===!1)return;if(n.layers.test(r.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||i.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let i=t.update(n),c=n.material;if(Array.isArray(c)){let t=i.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=b(n,d,o,s);n.onBeforeShadow(e,n,r,a,i,t,u),e.renderBufferDirect(a,null,i,t,n,u),n.onAfterShadow(e,n,r,a,i,t,u)}}}else if(c.visible){let t=b(n,c,o,s);n.onBeforeShadow(e,n,r,a,i,t,null),e.renderBufferDirect(a,null,i,t,n,null),n.onAfterShadow(e,n,r,a,i,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)x(c[e],r,a,o,s)}function S(e){e.target.removeEventListener(`dispose`,S);for(let t in u){let n=u[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}var js={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function Ms(e,t){function n(){let t=!1,n=new bt,r=null,i=new bt(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?ue(e.DEPTH_TEST):de(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=js[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(r&&(t=1-t),e.clearDepth(t),o=t)},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?ue(e.STENCIL_TEST):de(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new H(0,0,0),w=0,T=!1,E=null,D=null,ee=null,O=null,k=null,te=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),ne=!1,A=0,re=e.getParameter(e.VERSION);re.indexOf(`WebGL`)===-1?re.indexOf(`OpenGL ES`)!==-1&&(A=parseFloat(/^OpenGL ES (\d)/.exec(re)[1]),ne=A>=2):(A=parseFloat(/^WebGL (\d)/.exec(re)[1]),ne=A>=1);let j=null,M={},ie=e.getParameter(e.SCISSOR_BOX),ae=e.getParameter(e.VIEWPORT),oe=new bt().fromArray(ie),se=new bt().fromArray(ae);function ce(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let le={};le[e.TEXTURE_2D]=ce(e.TEXTURE_2D,e.TEXTURE_2D,1),le[e.TEXTURE_CUBE_MAP]=ce(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),le[e.TEXTURE_2D_ARRAY]=ce(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),le[e.TEXTURE_3D]=ce(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),ue(e.DEPTH_TEST),o.setFunc(3),ve(!1),ye(1),ue(e.CULL_FACE),_e(0);function ue(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function de(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function fe(t,n){return d[t]!==n&&(e.bindFramebuffer(t,n),d[t]=n,t===e.DRAW_FRAMEBUFFER&&(d[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(d[e.DRAW_FRAMEBUFFER]=n),!0)}function pe(t,n){let r=p,i=!1;if(t){r=f.get(n),r===void 0&&(r=[],f.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function me(t){return m!==t&&(e.useProgram(t),m=t,!0)}let he={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};he[103]=e.MIN,he[104]=e.MAX;let ge={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function _e(t,n,r,i,a,o,s,c,l,u){if(t===0){h===!0&&(de(e.BLEND),h=!1);return}if(h===!1&&(ue(e.BLEND),h=!0),t!==5){if(t!==g||u!==T){if((_!==100||b!==100)&&(e.blendEquation(e.FUNC_ADD),_=100,b=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:console.error(`THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:console.error(`THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}v=null,y=null,x=null,S=null,C.set(0,0,0),w=0,g=t,T=u}return}a=a||n,o=o||r,s=s||i,(n!==_||a!==b)&&(e.blendEquationSeparate(he[n],he[a]),_=n,b=a),(r!==v||i!==y||o!==x||s!==S)&&(e.blendFuncSeparate(ge[r],ge[i],ge[o],ge[s]),v=r,y=i,x=o,S=s),(c.equals(C)===!1||l!==w)&&(e.blendColor(c.r,c.g,c.b,l),C.copy(c),w=l),g=t,T=!1}function N(t,n){t.side===2?de(e.CULL_FACE):ue(e.CULL_FACE);let r=t.side===1;n&&(r=!r),ve(r),t.blending===1&&t.transparent===!1?_e(0):_e(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),P(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?ue(e.SAMPLE_ALPHA_TO_COVERAGE):de(e.SAMPLE_ALPHA_TO_COVERAGE)}function ve(t){E!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),E=t)}function ye(t){t===0?de(e.CULL_FACE):(ue(e.CULL_FACE),t!==D&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),D=t}function be(t){t!==ee&&(ne&&e.lineWidth(t),ee=t)}function P(t,n,r){t?(ue(e.POLYGON_OFFSET_FILL),(O!==n||k!==r)&&(e.polygonOffset(n,r),O=n,k=r)):de(e.POLYGON_OFFSET_FILL)}function xe(t){t?ue(e.SCISSOR_TEST):de(e.SCISSOR_TEST)}function F(t){t===void 0&&(t=e.TEXTURE0+te-1),j!==t&&(e.activeTexture(t),j=t)}function I(t,n,r){r===void 0&&(r=j===null?e.TEXTURE0+te-1:j);let i=M[r];i===void 0&&(i={type:void 0,texture:void 0},M[r]=i),(i.type!==t||i.texture!==n)&&(j!==r&&(e.activeTexture(r),j=r),e.bindTexture(t,n||le[t]),i.type=t,i.texture=n)}function Se(){let t=M[j];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Ce(){try{e.compressedTexImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function we(){try{e.compressedTexImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Te(){try{e.texSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ee(){try{e.texSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function De(){try{e.compressedTexSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Oe(){try{e.compressedTexSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function ke(){try{e.texStorage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ae(){try{e.texStorage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function je(){try{e.texImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Me(){try{e.texImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ne(t){oe.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),oe.copy(t))}function Pe(t){se.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),se.copy(t))}function Fe(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Ie(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Le(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),u={},j=null,M={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new H(0,0,0),w=0,T=!1,E=null,D=null,ee=null,O=null,k=null,oe.set(0,0,e.canvas.width,e.canvas.height),se.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:ue,disable:de,bindFramebuffer:fe,drawBuffers:pe,useProgram:me,setBlending:_e,setMaterial:N,setFlipSided:ve,setCullFace:ye,setLineWidth:be,setPolygonOffset:P,setScissorTest:xe,activeTexture:F,bindTexture:I,unbindTexture:Se,compressedTexImage2D:Ce,compressedTexImage3D:we,texImage2D:je,texImage3D:Me,updateUBOMapping:Fe,uniformBlockBinding:Ie,texStorage2D:ke,texStorage3D:Ae,texSubImage2D:Te,texSubImage3D:Ee,compressedTexSubImage2D:De,compressedTexSubImage3D:Oe,scissor:Ne,viewport:Pe,reset:Le}}function Ns(l,u,d,f,p,m,h){let g=u.has(`WEBGL_multisampled_render_to_texture`)?u.get(`WEBGL_multisampled_render_to_texture`):null,_=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),v=new R,y=new WeakMap,b,x=new WeakMap,S=!1;try{S=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function C(e,t){return S?new OffscreenCanvas(e,t):nt(`canvas`)}function w(e,t,n){let r=1,i=je(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);b===void 0&&(b=C(n,a));let o=t?C(n,a):b;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),console.warn(`THREE.WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&console.warn(`THREE.WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function T(e){return e.generateMipmaps}function D(e){l.generateMipmap(e)}function ee(e){return e.isWebGLCubeRenderTarget?l.TEXTURE_CUBE_MAP:e.isWebGL3DRenderTarget?l.TEXTURE_3D:e.isWebGLArrayRenderTarget||e.isCompressedArrayTexture?l.TEXTURE_2D_ARRAY:l.TEXTURE_2D}function O(e,t,n,r,i=!1){if(e!==null){if(l[e]!==void 0)return l[e];console.warn(`THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '`+e+`'`)}let a=t;if(t===l.RED&&(n===l.FLOAT&&(a=l.R32F),n===l.HALF_FLOAT&&(a=l.R16F),n===l.UNSIGNED_BYTE&&(a=l.R8)),t===l.RED_INTEGER&&(n===l.UNSIGNED_BYTE&&(a=l.R8UI),n===l.UNSIGNED_SHORT&&(a=l.R16UI),n===l.UNSIGNED_INT&&(a=l.R32UI),n===l.BYTE&&(a=l.R8I),n===l.SHORT&&(a=l.R16I),n===l.INT&&(a=l.R32I)),t===l.RG&&(n===l.FLOAT&&(a=l.RG32F),n===l.HALF_FLOAT&&(a=l.RG16F),n===l.UNSIGNED_BYTE&&(a=l.RG8)),t===l.RG_INTEGER&&(n===l.UNSIGNED_BYTE&&(a=l.RG8UI),n===l.UNSIGNED_SHORT&&(a=l.RG16UI),n===l.UNSIGNED_INT&&(a=l.RG32UI),n===l.BYTE&&(a=l.RG8I),n===l.SHORT&&(a=l.RG16I),n===l.INT&&(a=l.RG32I)),t===l.RGB_INTEGER&&(n===l.UNSIGNED_BYTE&&(a=l.RGB8UI),n===l.UNSIGNED_SHORT&&(a=l.RGB16UI),n===l.UNSIGNED_INT&&(a=l.RGB32UI),n===l.BYTE&&(a=l.RGB8I),n===l.SHORT&&(a=l.RGB16I),n===l.INT&&(a=l.RGB32I)),t===l.RGBA_INTEGER&&(n===l.UNSIGNED_BYTE&&(a=l.RGBA8UI),n===l.UNSIGNED_SHORT&&(a=l.RGBA16UI),n===l.UNSIGNED_INT&&(a=l.RGBA32UI),n===l.BYTE&&(a=l.RGBA8I),n===l.SHORT&&(a=l.RGBA16I),n===l.INT&&(a=l.RGBA32I)),t===l.RGB&&(n===l.UNSIGNED_INT_5_9_9_9_REV&&(a=l.RGB9_E5),n===l.UNSIGNED_INT_10F_11F_11F_REV&&(a=l.R11F_G11F_B10F)),t===l.RGBA){let e=i?Le:V.getTransfer(r);n===l.FLOAT&&(a=l.RGBA32F),n===l.HALF_FLOAT&&(a=l.RGBA16F),n===l.UNSIGNED_BYTE&&(a=e===`srgb`?l.SRGB8_ALPHA8:l.RGBA8),n===l.UNSIGNED_SHORT_4_4_4_4&&(a=l.RGBA4),n===l.UNSIGNED_SHORT_5_5_5_1&&(a=l.RGB5_A1)}return(a===l.R16F||a===l.R32F||a===l.RG16F||a===l.RG32F||a===l.RGBA16F||a===l.RGBA32F)&&u.get(`EXT_color_buffer_float`),a}function k(e,t){let n;return e?t===null||t===1014||t===1020?n=l.DEPTH24_STENCIL8:t===1015?n=l.DEPTH32F_STENCIL8:t===1012&&(n=l.DEPTH24_STENCIL8,console.warn(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):t===null||t===1014||t===1020?n=l.DEPTH_COMPONENT24:t===1015?n=l.DEPTH_COMPONENT32F:t===1012&&(n=l.DEPTH_COMPONENT16),n}function te(e,t){return T(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function ne(e){let t=e.target;t.removeEventListener(`dispose`,ne),re(t),t.isVideoTexture&&y.delete(t)}function A(e){let t=e.target;t.removeEventListener(`dispose`,A),M(t)}function re(e){let t=f.get(e);if(t.__webglInit===void 0)return;let n=e.source,r=x.get(n);if(r){let i=r[t.__cacheKey];i.usedTimes--,i.usedTimes===0&&j(e),Object.keys(r).length===0&&x.delete(n)}f.remove(e)}function j(e){let t=f.get(e);l.deleteTexture(t.__webglTexture);let n=e.source,r=x.get(n);delete r[t.__cacheKey],h.memory.textures--}function M(e){let t=f.get(e);if(e.depthTexture&&(e.depthTexture.dispose(),f.remove(e.depthTexture)),e.isWebGLCubeRenderTarget)for(let e=0;e<6;e++){if(Array.isArray(t.__webglFramebuffer[e]))for(let n=0;n<t.__webglFramebuffer[e].length;n++)l.deleteFramebuffer(t.__webglFramebuffer[e][n]);else l.deleteFramebuffer(t.__webglFramebuffer[e]);t.__webglDepthbuffer&&l.deleteRenderbuffer(t.__webglDepthbuffer[e])}else{if(Array.isArray(t.__webglFramebuffer))for(let e=0;e<t.__webglFramebuffer.length;e++)l.deleteFramebuffer(t.__webglFramebuffer[e]);else l.deleteFramebuffer(t.__webglFramebuffer);if(t.__webglDepthbuffer&&l.deleteRenderbuffer(t.__webglDepthbuffer),t.__webglMultisampledFramebuffer&&l.deleteFramebuffer(t.__webglMultisampledFramebuffer),t.__webglColorRenderbuffer)for(let e=0;e<t.__webglColorRenderbuffer.length;e++)t.__webglColorRenderbuffer[e]&&l.deleteRenderbuffer(t.__webglColorRenderbuffer[e]);t.__webglDepthRenderbuffer&&l.deleteRenderbuffer(t.__webglDepthRenderbuffer)}let n=e.textures;for(let e=0,t=n.length;e<t;e++){let t=f.get(n[e]);t.__webglTexture&&(l.deleteTexture(t.__webglTexture),h.memory.textures--),f.remove(n[e])}f.remove(e)}let ie=0;function ae(){ie=0}function oe(){let e=ie;return e>=p.maxTextures&&console.warn(`THREE.WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+p.maxTextures),ie+=1,e}function se(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function ce(e,t){let n=f.get(e);if(e.isVideoTexture&&ke(e),e.isRenderTargetTexture===!1&&e.isExternalTexture!==!0&&e.version>0&&n.__version!==e.version){let r=e.image;if(r===null)console.warn(`THREE.WebGLRenderer: Texture marked for update but no image data found.`);else if(r.complete===!1)console.warn(`THREE.WebGLRenderer: Texture marked for update but image is incomplete`);else{ve(n,e,t);return}}else e.isExternalTexture&&(n.__webglTexture=e.sourceTexture?e.sourceTexture:null);d.bindTexture(l.TEXTURE_2D,n.__webglTexture,l.TEXTURE0+t)}function le(e,t){let n=f.get(e);if(e.isRenderTargetTexture===!1&&e.version>0&&n.__version!==e.version){ve(n,e,t);return}d.bindTexture(l.TEXTURE_2D_ARRAY,n.__webglTexture,l.TEXTURE0+t)}function ue(e,t){let n=f.get(e);if(e.isRenderTargetTexture===!1&&e.version>0&&n.__version!==e.version){ve(n,e,t);return}d.bindTexture(l.TEXTURE_3D,n.__webglTexture,l.TEXTURE0+t)}function de(e,t){let n=f.get(e);if(e.version>0&&n.__version!==e.version){ye(n,e,t);return}d.bindTexture(l.TEXTURE_CUBE_MAP,n.__webglTexture,l.TEXTURE0+t)}let fe={[e]:l.REPEAT,[t]:l.CLAMP_TO_EDGE,[n]:l.MIRRORED_REPEAT},pe={[r]:l.NEAREST,[i]:l.NEAREST_MIPMAP_NEAREST,[a]:l.NEAREST_MIPMAP_LINEAR,[o]:l.LINEAR,[s]:l.LINEAR_MIPMAP_NEAREST,[c]:l.LINEAR_MIPMAP_LINEAR},me={512:l.NEVER,519:l.ALWAYS,513:l.LESS,515:l.LEQUAL,514:l.EQUAL,518:l.GEQUAL,516:l.GREATER,517:l.NOTEQUAL};function he(e,t){if(t.type===1015&&u.has(`OES_texture_float_linear`)===!1&&(t.magFilter===1006||t.magFilter===1007||t.magFilter===1005||t.magFilter===1008||t.minFilter===1006||t.minFilter===1007||t.minFilter===1005||t.minFilter===1008)&&console.warn(`THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),l.texParameteri(e,l.TEXTURE_WRAP_S,fe[t.wrapS]),l.texParameteri(e,l.TEXTURE_WRAP_T,fe[t.wrapT]),(e===l.TEXTURE_3D||e===l.TEXTURE_2D_ARRAY)&&l.texParameteri(e,l.TEXTURE_WRAP_R,fe[t.wrapR]),l.texParameteri(e,l.TEXTURE_MAG_FILTER,pe[t.magFilter]),l.texParameteri(e,l.TEXTURE_MIN_FILTER,pe[t.minFilter]),t.compareFunction&&(l.texParameteri(e,l.TEXTURE_COMPARE_MODE,l.COMPARE_REF_TO_TEXTURE),l.texParameteri(e,l.TEXTURE_COMPARE_FUNC,me[t.compareFunction])),u.has(`EXT_texture_filter_anisotropic`)===!0){if(t.magFilter===1003||t.minFilter!==1005&&t.minFilter!==1008||t.type===1015&&u.has(`OES_texture_float_linear`)===!1)return;if(t.anisotropy>1||f.get(t).__currentAnisotropy){let n=u.get(`EXT_texture_filter_anisotropic`);l.texParameterf(e,n.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(t.anisotropy,p.getMaxAnisotropy())),f.get(t).__currentAnisotropy=t.anisotropy}}}function ge(e,t){let n=!1;e.__webglInit===void 0&&(e.__webglInit=!0,t.addEventListener(`dispose`,ne));let r=t.source,i=x.get(r);i===void 0&&(i={},x.set(r,i));let a=se(t);if(a!==e.__cacheKey){i[a]===void 0&&(i[a]={texture:l.createTexture(),usedTimes:0},h.memory.textures++,n=!0),i[a].usedTimes++;let r=i[e.__cacheKey];r!==void 0&&(i[e.__cacheKey].usedTimes--,r.usedTimes===0&&j(t)),e.__cacheKey=a,e.__webglTexture=i[a].texture}return n}function _e(e,t,n){return Math.floor(Math.floor(e/n)/t)}function N(e,t,n,r){let i=e.updateRanges;if(i.length===0)d.texSubImage2D(l.TEXTURE_2D,0,0,0,t.width,t.height,n,r,t.data);else{i.sort((e,t)=>e.start-t.start);let a=0;for(let e=1;e<i.length;e++){let n=i[a],r=i[e],o=n.start+n.count,s=_e(r.start,t.width,4),c=_e(n.start,t.width,4);r.start<=o+1&&s===c&&_e(r.start+r.count-1,t.width,4)===s?n.count=Math.max(n.count,r.start+r.count-n.start):(++a,i[a]=r)}i.length=a+1;let o=l.getParameter(l.UNPACK_ROW_LENGTH),s=l.getParameter(l.UNPACK_SKIP_PIXELS),c=l.getParameter(l.UNPACK_SKIP_ROWS);l.pixelStorei(l.UNPACK_ROW_LENGTH,t.width);for(let e=0,a=i.length;e<a;e++){let a=i[e],o=Math.floor(a.start/4),s=Math.ceil(a.count/4),c=o%t.width,u=Math.floor(o/t.width),f=s;l.pixelStorei(l.UNPACK_SKIP_PIXELS,c),l.pixelStorei(l.UNPACK_SKIP_ROWS,u),d.texSubImage2D(l.TEXTURE_2D,0,c,u,f,1,n,r,t.data)}e.clearUpdateRanges(),l.pixelStorei(l.UNPACK_ROW_LENGTH,o),l.pixelStorei(l.UNPACK_SKIP_PIXELS,s),l.pixelStorei(l.UNPACK_SKIP_ROWS,c)}}function ve(e,t,n){let r=l.TEXTURE_2D;(t.isDataArrayTexture||t.isCompressedArrayTexture)&&(r=l.TEXTURE_2D_ARRAY),t.isData3DTexture&&(r=l.TEXTURE_3D);let i=ge(e,t),a=t.source;d.bindTexture(r,e.__webglTexture,l.TEXTURE0+n);let o=f.get(a);if(a.version!==o.__version||i===!0){d.activeTexture(l.TEXTURE0+n);let e=V.getPrimaries(V.workingColorSpace),s=t.colorSpace===``?null:V.getPrimaries(t.colorSpace),c=t.colorSpace===``||e===s?l.NONE:l.BROWSER_DEFAULT_WEBGL;l.pixelStorei(l.UNPACK_FLIP_Y_WEBGL,t.flipY),l.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),l.pixelStorei(l.UNPACK_ALIGNMENT,t.unpackAlignment),l.pixelStorei(l.UNPACK_COLORSPACE_CONVERSION_WEBGL,c);let u=w(t.image,!1,p.maxTextureSize);u=Ae(t,u);let f=m.convert(t.format,t.colorSpace),h=m.convert(t.type),g=O(t.internalFormat,f,h,t.colorSpace,t.isVideoTexture);he(r,t);let _,v=t.mipmaps,y=t.isVideoTexture!==!0,b=o.__version===void 0||i===!0,x=a.dataReady,S=te(t,u);if(t.isDepthTexture)g=k(t.format===E,t.type),b&&(y?d.texStorage2D(l.TEXTURE_2D,1,g,u.width,u.height):d.texImage2D(l.TEXTURE_2D,0,g,u.width,u.height,0,f,h,null));else if(t.isDataTexture){if(v.length>0){y&&b&&d.texStorage2D(l.TEXTURE_2D,S,g,v[0].width,v[0].height);for(let e=0,t=v.length;e<t;e++)_=v[e],y?x&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,_.width,_.height,f,h,_.data):d.texImage2D(l.TEXTURE_2D,e,g,_.width,_.height,0,f,h,_.data);t.generateMipmaps=!1}else y?(b&&d.texStorage2D(l.TEXTURE_2D,S,g,u.width,u.height),x&&N(t,u,f,h)):d.texImage2D(l.TEXTURE_2D,0,g,u.width,u.height,0,f,h,u.data)}else if(t.isCompressedTexture){if(t.isCompressedArrayTexture){y&&b&&d.texStorage3D(l.TEXTURE_2D_ARRAY,S,g,v[0].width,v[0].height,u.depth);for(let e=0,n=v.length;e<n;e++)if(_=v[e],t.format!==1023){if(f!==null){if(y){if(x){if(t.layerUpdates.size>0){let n=zi(_.width,_.height,t.format,t.type);for(let r of t.layerUpdates){let t=_.data.subarray(r*n/_.data.BYTES_PER_ELEMENT,(r+1)*n/_.data.BYTES_PER_ELEMENT);d.compressedTexSubImage3D(l.TEXTURE_2D_ARRAY,e,0,0,r,_.width,_.height,1,f,t)}t.clearLayerUpdates()}else d.compressedTexSubImage3D(l.TEXTURE_2D_ARRAY,e,0,0,0,_.width,_.height,u.depth,f,_.data)}}else d.compressedTexImage3D(l.TEXTURE_2D_ARRAY,e,g,_.width,_.height,u.depth,0,_.data,0,0)}else console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else y?x&&d.texSubImage3D(l.TEXTURE_2D_ARRAY,e,0,0,0,_.width,_.height,u.depth,f,h,_.data):d.texImage3D(l.TEXTURE_2D_ARRAY,e,g,_.width,_.height,u.depth,0,f,h,_.data)}else{y&&b&&d.texStorage2D(l.TEXTURE_2D,S,g,v[0].width,v[0].height);for(let e=0,n=v.length;e<n;e++)_=v[e],t.format===1023?y?x&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,_.width,_.height,f,h,_.data):d.texImage2D(l.TEXTURE_2D,e,g,_.width,_.height,0,f,h,_.data):f===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):y?x&&d.compressedTexSubImage2D(l.TEXTURE_2D,e,0,0,_.width,_.height,f,_.data):d.compressedTexImage2D(l.TEXTURE_2D,e,g,_.width,_.height,0,_.data)}}else if(t.isDataArrayTexture){if(y){if(b&&d.texStorage3D(l.TEXTURE_2D_ARRAY,S,g,u.width,u.height,u.depth),x){if(t.layerUpdates.size>0){let e=zi(u.width,u.height,t.format,t.type);for(let n of t.layerUpdates){let t=u.data.subarray(n*e/u.data.BYTES_PER_ELEMENT,(n+1)*e/u.data.BYTES_PER_ELEMENT);d.texSubImage3D(l.TEXTURE_2D_ARRAY,0,0,0,n,u.width,u.height,1,f,h,t)}t.clearLayerUpdates()}else d.texSubImage3D(l.TEXTURE_2D_ARRAY,0,0,0,0,u.width,u.height,u.depth,f,h,u.data)}}else d.texImage3D(l.TEXTURE_2D_ARRAY,0,g,u.width,u.height,u.depth,0,f,h,u.data)}else if(t.isData3DTexture)y?(b&&d.texStorage3D(l.TEXTURE_3D,S,g,u.width,u.height,u.depth),x&&d.texSubImage3D(l.TEXTURE_3D,0,0,0,0,u.width,u.height,u.depth,f,h,u.data)):d.texImage3D(l.TEXTURE_3D,0,g,u.width,u.height,u.depth,0,f,h,u.data);else if(t.isFramebufferTexture){if(b){if(y)d.texStorage2D(l.TEXTURE_2D,S,g,u.width,u.height);else{let e=u.width,t=u.height;for(let n=0;n<S;n++)d.texImage2D(l.TEXTURE_2D,n,g,e,t,0,f,h,null),e>>=1,t>>=1}}}else if(v.length>0){if(y&&b){let e=je(v[0]);d.texStorage2D(l.TEXTURE_2D,S,g,e.width,e.height)}for(let e=0,t=v.length;e<t;e++)_=v[e],y?x&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,f,h,_):d.texImage2D(l.TEXTURE_2D,e,g,f,h,_);t.generateMipmaps=!1}else if(y){if(b){let e=je(u);d.texStorage2D(l.TEXTURE_2D,S,g,e.width,e.height)}x&&d.texSubImage2D(l.TEXTURE_2D,0,0,0,f,h,u)}else d.texImage2D(l.TEXTURE_2D,0,g,f,h,u);T(t)&&D(r),o.__version=a.version,t.onUpdate&&t.onUpdate(t)}e.__version=t.version}function ye(e,t,n){if(t.image.length!==6)return;let r=ge(e,t),i=t.source;d.bindTexture(l.TEXTURE_CUBE_MAP,e.__webglTexture,l.TEXTURE0+n);let a=f.get(i);if(i.version!==a.__version||r===!0){d.activeTexture(l.TEXTURE0+n);let e=V.getPrimaries(V.workingColorSpace),o=t.colorSpace===``?null:V.getPrimaries(t.colorSpace),s=t.colorSpace===``||e===o?l.NONE:l.BROWSER_DEFAULT_WEBGL;l.pixelStorei(l.UNPACK_FLIP_Y_WEBGL,t.flipY),l.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),l.pixelStorei(l.UNPACK_ALIGNMENT,t.unpackAlignment),l.pixelStorei(l.UNPACK_COLORSPACE_CONVERSION_WEBGL,s);let c=t.isCompressedTexture||t.image[0].isCompressedTexture,u=t.image[0]&&t.image[0].isDataTexture,f=[];for(let e=0;e<6;e++)!c&&!u?f[e]=w(t.image[e],!0,p.maxCubemapSize):f[e]=u?t.image[e].image:t.image[e],f[e]=Ae(t,f[e]);let h=f[0],g=m.convert(t.format,t.colorSpace),_=m.convert(t.type),v=O(t.internalFormat,g,_,t.colorSpace),y=t.isVideoTexture!==!0,b=a.__version===void 0||r===!0,x=i.dataReady,S=te(t,h);he(l.TEXTURE_CUBE_MAP,t);let C;if(c){y&&b&&d.texStorage2D(l.TEXTURE_CUBE_MAP,S,v,h.width,h.height);for(let e=0;e<6;e++){C=f[e].mipmaps;for(let n=0;n<C.length;n++){let r=C[n];t.format===1023?y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,0,0,r.width,r.height,g,_,r.data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,v,r.width,r.height,0,g,_,r.data):g===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):y?x&&d.compressedTexSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,0,0,r.width,r.height,g,r.data):d.compressedTexImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,v,r.width,r.height,0,r.data)}}}else{if(C=t.mipmaps,y&&b){C.length>0&&S++;let e=je(f[0]);d.texStorage2D(l.TEXTURE_CUBE_MAP,S,v,e.width,e.height)}for(let e=0;e<6;e++)if(u){y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,0,0,f[e].width,f[e].height,g,_,f[e].data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,v,f[e].width,f[e].height,0,g,_,f[e].data);for(let t=0;t<C.length;t++){let n=C[t].image[e].image;y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,0,0,n.width,n.height,g,_,n.data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,v,n.width,n.height,0,g,_,n.data)}}else{y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,0,0,g,_,f[e]):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,v,g,_,f[e]);for(let t=0;t<C.length;t++){let n=C[t];y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,0,0,g,_,n.image[e]):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,v,g,_,n.image[e])}}}T(t)&&D(l.TEXTURE_CUBE_MAP),a.__version=i.version,t.onUpdate&&t.onUpdate(t)}e.__version=t.version}function be(e,t,n,r,i,a){let o=m.convert(n.format,n.colorSpace),s=m.convert(n.type),c=O(n.internalFormat,o,s,n.colorSpace),u=f.get(t),p=f.get(n);if(p.__renderTarget=t,!u.__hasExternalTextures){let e=Math.max(1,t.width>>a),n=Math.max(1,t.height>>a);i===l.TEXTURE_3D||i===l.TEXTURE_2D_ARRAY?d.texImage3D(i,a,c,e,n,t.depth,0,o,s,null):d.texImage2D(i,a,c,e,n,0,o,s,null)}d.bindFramebuffer(l.FRAMEBUFFER,e),Oe(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,r,i,p.__webglTexture,0,De(t)):(i===l.TEXTURE_2D||i>=l.TEXTURE_CUBE_MAP_POSITIVE_X&&i<=l.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&l.framebufferTexture2D(l.FRAMEBUFFER,r,i,p.__webglTexture,a),d.bindFramebuffer(l.FRAMEBUFFER,null)}function P(e,t,n){if(l.bindRenderbuffer(l.RENDERBUFFER,e),t.depthBuffer){let r=t.depthTexture,i=r&&r.isDepthTexture?r.type:null,a=k(t.stencilBuffer,i),o=t.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,s=De(t);Oe(t)?g.renderbufferStorageMultisampleEXT(l.RENDERBUFFER,s,a,t.width,t.height):n?l.renderbufferStorageMultisample(l.RENDERBUFFER,s,a,t.width,t.height):l.renderbufferStorage(l.RENDERBUFFER,a,t.width,t.height),l.framebufferRenderbuffer(l.FRAMEBUFFER,o,l.RENDERBUFFER,e)}else{let e=t.textures;for(let r=0;r<e.length;r++){let i=e[r],a=m.convert(i.format,i.colorSpace),o=m.convert(i.type),s=O(i.internalFormat,a,o,i.colorSpace),c=De(t);n&&Oe(t)===!1?l.renderbufferStorageMultisample(l.RENDERBUFFER,c,s,t.width,t.height):Oe(t)?g.renderbufferStorageMultisampleEXT(l.RENDERBUFFER,c,s,t.width,t.height):l.renderbufferStorage(l.RENDERBUFFER,s,t.width,t.height)}}l.bindRenderbuffer(l.RENDERBUFFER,null)}function xe(e,t){if(t&&t.isWebGLCubeRenderTarget)throw Error(`Depth Texture with cube render targets is not supported`);if(d.bindFramebuffer(l.FRAMEBUFFER,e),!(t.depthTexture&&t.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let n=f.get(t.depthTexture);n.__renderTarget=t,(!n.__webglTexture||t.depthTexture.image.width!==t.width||t.depthTexture.image.height!==t.height)&&(t.depthTexture.image.width=t.width,t.depthTexture.image.height=t.height,t.depthTexture.needsUpdate=!0),ce(t.depthTexture,0);let r=n.__webglTexture,i=De(t);if(t.depthTexture.format===1026)Oe(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,l.DEPTH_ATTACHMENT,l.TEXTURE_2D,r,0,i):l.framebufferTexture2D(l.FRAMEBUFFER,l.DEPTH_ATTACHMENT,l.TEXTURE_2D,r,0);else if(t.depthTexture.format===1027)Oe(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,l.DEPTH_STENCIL_ATTACHMENT,l.TEXTURE_2D,r,0,i):l.framebufferTexture2D(l.FRAMEBUFFER,l.DEPTH_STENCIL_ATTACHMENT,l.TEXTURE_2D,r,0);else throw Error(`Unknown depthTexture format`)}function F(e){let t=f.get(e),n=e.isWebGLCubeRenderTarget===!0;if(t.__boundDepthTexture!==e.depthTexture){let n=e.depthTexture;if(t.__depthDisposeCallback&&t.__depthDisposeCallback(),n){let e=()=>{delete t.__boundDepthTexture,delete t.__depthDisposeCallback,n.removeEventListener(`dispose`,e)};n.addEventListener(`dispose`,e),t.__depthDisposeCallback=e}t.__boundDepthTexture=n}if(e.depthTexture&&!t.__autoAllocateDepthBuffer){if(n)throw Error(`target.depthTexture not supported in Cube render targets`);let r=e.texture.mipmaps;r&&r.length>0?xe(t.__webglFramebuffer[0],e):xe(t.__webglFramebuffer,e)}else if(n){t.__webglDepthbuffer=[];for(let n=0;n<6;n++)if(d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer[n]),t.__webglDepthbuffer[n]===void 0)t.__webglDepthbuffer[n]=l.createRenderbuffer(),P(t.__webglDepthbuffer[n],e,!1);else{let r=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,i=t.__webglDepthbuffer[n];l.bindRenderbuffer(l.RENDERBUFFER,i),l.framebufferRenderbuffer(l.FRAMEBUFFER,r,l.RENDERBUFFER,i)}}else{let n=e.texture.mipmaps;if(n&&n.length>0?d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer[0]):d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer),t.__webglDepthbuffer===void 0)t.__webglDepthbuffer=l.createRenderbuffer(),P(t.__webglDepthbuffer,e,!1);else{let n=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,r=t.__webglDepthbuffer;l.bindRenderbuffer(l.RENDERBUFFER,r),l.framebufferRenderbuffer(l.FRAMEBUFFER,n,l.RENDERBUFFER,r)}}d.bindFramebuffer(l.FRAMEBUFFER,null)}function I(e,t,n){let r=f.get(e);t!==void 0&&be(r.__webglFramebuffer,e,e.texture,l.COLOR_ATTACHMENT0,l.TEXTURE_2D,0),n!==void 0&&F(e)}function Se(e){let t=e.texture,n=f.get(e),r=f.get(t);e.addEventListener(`dispose`,A);let i=e.textures,a=e.isWebGLCubeRenderTarget===!0,o=i.length>1;if(o||(r.__webglTexture===void 0&&(r.__webglTexture=l.createTexture()),r.__version=t.version,h.memory.textures++),a){n.__webglFramebuffer=[];for(let e=0;e<6;e++)if(t.mipmaps&&t.mipmaps.length>0){n.__webglFramebuffer[e]=[];for(let r=0;r<t.mipmaps.length;r++)n.__webglFramebuffer[e][r]=l.createFramebuffer()}else n.__webglFramebuffer[e]=l.createFramebuffer()}else{if(t.mipmaps&&t.mipmaps.length>0){n.__webglFramebuffer=[];for(let e=0;e<t.mipmaps.length;e++)n.__webglFramebuffer[e]=l.createFramebuffer()}else n.__webglFramebuffer=l.createFramebuffer();if(o)for(let e=0,t=i.length;e<t;e++){let t=f.get(i[e]);t.__webglTexture===void 0&&(t.__webglTexture=l.createTexture(),h.memory.textures++)}if(e.samples>0&&Oe(e)===!1){n.__webglMultisampledFramebuffer=l.createFramebuffer(),n.__webglColorRenderbuffer=[],d.bindFramebuffer(l.FRAMEBUFFER,n.__webglMultisampledFramebuffer);for(let t=0;t<i.length;t++){let r=i[t];n.__webglColorRenderbuffer[t]=l.createRenderbuffer(),l.bindRenderbuffer(l.RENDERBUFFER,n.__webglColorRenderbuffer[t]);let a=m.convert(r.format,r.colorSpace),o=m.convert(r.type),s=O(r.internalFormat,a,o,r.colorSpace,e.isXRRenderTarget===!0),c=De(e);l.renderbufferStorageMultisample(l.RENDERBUFFER,c,s,e.width,e.height),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+t,l.RENDERBUFFER,n.__webglColorRenderbuffer[t])}l.bindRenderbuffer(l.RENDERBUFFER,null),e.depthBuffer&&(n.__webglDepthRenderbuffer=l.createRenderbuffer(),P(n.__webglDepthRenderbuffer,e,!0)),d.bindFramebuffer(l.FRAMEBUFFER,null)}}if(a){d.bindTexture(l.TEXTURE_CUBE_MAP,r.__webglTexture),he(l.TEXTURE_CUBE_MAP,t);for(let r=0;r<6;r++)if(t.mipmaps&&t.mipmaps.length>0)for(let i=0;i<t.mipmaps.length;i++)be(n.__webglFramebuffer[r][i],e,t,l.COLOR_ATTACHMENT0,l.TEXTURE_CUBE_MAP_POSITIVE_X+r,i);else be(n.__webglFramebuffer[r],e,t,l.COLOR_ATTACHMENT0,l.TEXTURE_CUBE_MAP_POSITIVE_X+r,0);T(t)&&D(l.TEXTURE_CUBE_MAP),d.unbindTexture()}else if(o){for(let t=0,r=i.length;t<r;t++){let r=i[t],a=f.get(r),o=l.TEXTURE_2D;(e.isWebGL3DRenderTarget||e.isWebGLArrayRenderTarget)&&(o=e.isWebGL3DRenderTarget?l.TEXTURE_3D:l.TEXTURE_2D_ARRAY),d.bindTexture(o,a.__webglTexture),he(o,r),be(n.__webglFramebuffer,e,r,l.COLOR_ATTACHMENT0+t,o,0),T(r)&&D(o)}d.unbindTexture()}else{let i=l.TEXTURE_2D;if((e.isWebGL3DRenderTarget||e.isWebGLArrayRenderTarget)&&(i=e.isWebGL3DRenderTarget?l.TEXTURE_3D:l.TEXTURE_2D_ARRAY),d.bindTexture(i,r.__webglTexture),he(i,t),t.mipmaps&&t.mipmaps.length>0)for(let r=0;r<t.mipmaps.length;r++)be(n.__webglFramebuffer[r],e,t,l.COLOR_ATTACHMENT0,i,r);else be(n.__webglFramebuffer,e,t,l.COLOR_ATTACHMENT0,i,0);T(t)&&D(i),d.unbindTexture()}e.depthBuffer&&F(e)}function Ce(e){let t=e.textures;for(let n=0,r=t.length;n<r;n++){let r=t[n];if(T(r)){let t=ee(e),n=f.get(r).__webglTexture;d.bindTexture(t,n),D(t),d.unbindTexture()}}}let we=[],Te=[];function Ee(e){if(e.samples>0){if(Oe(e)===!1){let t=e.textures,n=e.width,r=e.height,i=l.COLOR_BUFFER_BIT,a=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,o=f.get(e),s=t.length>1;if(s)for(let e=0;e<t.length;e++)d.bindFramebuffer(l.FRAMEBUFFER,o.__webglMultisampledFramebuffer),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.RENDERBUFFER,null),d.bindFramebuffer(l.FRAMEBUFFER,o.__webglFramebuffer),l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.TEXTURE_2D,null,0);d.bindFramebuffer(l.READ_FRAMEBUFFER,o.__webglMultisampledFramebuffer);let c=e.texture.mipmaps;c&&c.length>0?d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglFramebuffer[0]):d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglFramebuffer);for(let c=0;c<t.length;c++){if(e.resolveDepthBuffer&&(e.depthBuffer&&(i|=l.DEPTH_BUFFER_BIT),e.stencilBuffer&&e.resolveStencilBuffer&&(i|=l.STENCIL_BUFFER_BIT)),s){l.framebufferRenderbuffer(l.READ_FRAMEBUFFER,l.COLOR_ATTACHMENT0,l.RENDERBUFFER,o.__webglColorRenderbuffer[c]);let e=f.get(t[c]).__webglTexture;l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0,l.TEXTURE_2D,e,0)}l.blitFramebuffer(0,0,n,r,0,0,n,r,i,l.NEAREST),_===!0&&(we.length=0,Te.length=0,we.push(l.COLOR_ATTACHMENT0+c),e.depthBuffer&&e.resolveDepthBuffer===!1&&(we.push(a),Te.push(a),l.invalidateFramebuffer(l.DRAW_FRAMEBUFFER,Te)),l.invalidateFramebuffer(l.READ_FRAMEBUFFER,we))}if(d.bindFramebuffer(l.READ_FRAMEBUFFER,null),d.bindFramebuffer(l.DRAW_FRAMEBUFFER,null),s)for(let e=0;e<t.length;e++){d.bindFramebuffer(l.FRAMEBUFFER,o.__webglMultisampledFramebuffer),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.RENDERBUFFER,o.__webglColorRenderbuffer[e]);let n=f.get(t[e]).__webglTexture;d.bindFramebuffer(l.FRAMEBUFFER,o.__webglFramebuffer),l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.TEXTURE_2D,n,0)}d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglMultisampledFramebuffer)}else if(e.depthBuffer&&e.resolveDepthBuffer===!1&&_){let t=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT;l.invalidateFramebuffer(l.DRAW_FRAMEBUFFER,[t])}}}function De(e){return Math.min(p.maxSamples,e.samples)}function Oe(e){let t=f.get(e);return e.samples>0&&u.has(`WEBGL_multisampled_render_to_texture`)===!0&&t.__useRenderToTexture!==!1}function ke(e){let t=h.render.frame;y.get(e)!==t&&(y.set(e,t),e.update())}function Ae(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(V.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&console.warn(`THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):console.error(`THREE.WebGLTextures: Unsupported texture color space:`,n)),t}function je(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(v.width=e.naturalWidth||e.width,v.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(v.width=e.displayWidth,v.height=e.displayHeight):(v.width=e.width,v.height=e.height),v}this.allocateTextureUnit=oe,this.resetTextureUnits=ae,this.setTexture2D=ce,this.setTexture2DArray=le,this.setTexture3D=ue,this.setTextureCube=de,this.rebindTextures=I,this.setupRenderTarget=Se,this.updateRenderTargetMipmap=Ce,this.updateMultisampleRenderTarget=Ee,this.setupDepthRenderbuffer=F,this.setupFrameBufferTexture=be,this.useMultisampledRTT=Oe}function Ps(e,t){function n(n,r=``){let i,a=V.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Fs=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Is=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Ls=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new ri(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Mr({vertexShader:Fs,fragmentShader:Is,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new xr(new ii(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Rs=class extends He{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,u=null,d=null,f=null,p=null,h=null,g=typeof XRWebGLBinding<`u`,_=new Ls,v={},b=t.getContextAttributes(),x=null,S=null,C=[],D=[],ee=new R,O=null,k=new Lr;k.viewport=new bt;let te=new Lr;te.viewport=new bt;let ne=[k,te],A=new Si,re=null,j=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=C[e];return t===void 0&&(t=new Gr,C[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=C[e];return t===void 0&&(t=new Gr,C[e]=t),t.getGripSpace()},this.getHand=function(e){let t=C[e];return t===void 0&&(t=new Gr,C[e]=t),t.getHandSpace()};function M(e){let t=D.indexOf(e.inputSource);if(t===-1)return;let n=C[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ie(){r.removeEventListener(`select`,M),r.removeEventListener(`selectstart`,M),r.removeEventListener(`selectend`,M),r.removeEventListener(`squeeze`,M),r.removeEventListener(`squeezestart`,M),r.removeEventListener(`squeezeend`,M),r.removeEventListener(`end`,ie),r.removeEventListener(`inputsourceschange`,ae);for(let e=0;e<C.length;e++){let t=D[e];t!==null&&(D[e]=null,C[e].disconnect(t))}re=null,j=null,_.reset();for(let e in v)delete v[e];e.setRenderTarget(x),p=null,f=null,d=null,r=null,S=null,pe.stop(),n.isPresenting=!1,e.setPixelRatio(O),e.setSize(ee.width,ee.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return f===null?p:f},this.getBinding=function(){return d===null&&g&&(d=new XRWebGLBinding(r,t)),d},this.getFrame=function(){return h},this.getSession=function(){return r},this.setSession=async function(u){if(r=u,r!==null){if(x=e.getRenderTarget(),r.addEventListener(`select`,M),r.addEventListener(`selectstart`,M),r.addEventListener(`selectend`,M),r.addEventListener(`squeeze`,M),r.addEventListener(`squeezestart`,M),r.addEventListener(`squeezeend`,M),r.addEventListener(`end`,ie),r.addEventListener(`inputsourceschange`,ae),b.xrCompatible!==!0&&await t.makeXRCompatible(),O=e.getPixelRatio(),e.getSize(ee),g&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;b.depth&&(o=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=b.stencil?E:T,a=b.stencil?y:m);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};d=this.getBinding(),f=d.createProjectionLayer(s),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new St(f.textureWidth,f.textureHeight,{format:w,type:l,depthTexture:new ni(f.textureWidth,f.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{let n={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:i};p=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new St(p.framebufferWidth,p.framebufferHeight,{format:w,type:l,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),pe.setContext(r),pe.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function ae(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=D.indexOf(n);r>=0&&(D[r]=null,C[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=D.indexOf(n);if(r===-1){for(let e=0;e<C.length;e++)if(e>=D.length){D.push(n),r=e;break}else if(D[e]===null){D[e]=n,r=e;break}if(r===-1)break}let i=C[r];i&&i.connect(n)}}let oe=new z,se=new z;function ce(e,t,n){oe.setFromMatrixPosition(t.matrixWorld),se.setFromMatrixPosition(n.matrixWorld);let r=oe.distanceTo(se),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function le(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;_.texture!==null&&(_.depthNear>0&&(t=_.depthNear),_.depthFar>0&&(n=_.depthFar)),A.near=te.near=k.near=t,A.far=te.far=k.far=n,(re!==A.near||j!==A.far)&&(r.updateRenderState({depthNear:A.near,depthFar:A.far}),re=A.near,j=A.far),A.layers.mask=e.layers.mask|6,k.layers.mask=A.layers.mask&3,te.layers.mask=A.layers.mask&5;let i=e.parent,a=A.cameras;le(A,i);for(let e=0;e<a.length;e++)le(a[e],i);a.length===2?ce(A,k,te):A.projectionMatrix.copy(k.projectionMatrix),ue(e,A,i)};function ue(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=Ge*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return A},this.getFoveation=function(){if(f!==null||p!==null)return s},this.setFoveation=function(e){s=e,f!==null&&(f.fixedFoveation=e),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=e)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(A)},this.getCameraTexture=function(e){return v[e]};let de=null;function fe(t,i){if(u=i.getViewerPose(c||a),h=i,u!==null){let t=u.views;p!==null&&(e.setRenderTargetFramebuffer(S,p.framebuffer),e.setRenderTarget(S));let i=!1;t.length!==A.cameras.length&&(A.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(p!==null)a=p.getViewport(r);else{let t=d.getViewSubImage(f,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(S,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(S))}let o=ne[n];o===void 0&&(o=new Lr,o.layers.enable(n),o.viewport=new bt,ne[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(A.matrix.copy(o.matrix),A.matrix.decompose(A.position,A.quaternion,A.scale)),i===!0&&A.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&g){d=n.getBinding();let e=d.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&_.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&g){e.state.unbindTexture(),d=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=v[n];e||(e=new ri,v[n]=e);let t=d.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<C.length;e++){let t=D[e],n=C[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}de&&de(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),h=null}let pe=new Vi;pe.setAnimationLoop(fe),this.setAnimationLoop=function(e){de=e},this.dispose=function(){}}},zs=new ln,Bs=new Qt;function Vs(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,Or(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isMeshBasicMaterial||t.isMeshLambertMaterial?a(e,t):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,zs.copy(o),zs.x*=-1,zs.y*=-1,zs.z*=-1,a.isCubeTexture&&a.isRenderTargetTexture===!1&&(zs.y*=-1,zs.z*=-1),e.envMapRotation.value.setFromMatrix4(Bs.makeRotationFromEuler(zs)),e.flipEnvMap.value=a.isCubeTexture&&a.isRenderTargetTexture===!1?-1:1,e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Hs(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return console.error(`THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?console.warn(`THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.`):console.warn(`THREE.WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var Us=class{constructor(e={}){let{canvas:t=rt(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:u=!1,powerPreference:d=`default`,failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:p=!1}=e;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);m=n.getContextAttributes().alpha}else m=a;let h=new Uint32Array(4),_=new Int32Array(4),v=null,y=null,b=[],x=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let S=this,C=!1;this._outputColorSpace=Fe;let w=0,T=0,E=null,D=-1,ee=null,O=new bt,k=new bt,te=null,ne=new H(0),A=0,re=t.width,j=t.height,M=1,ie=null,ae=null,oe=new bt(0,0,re,j),se=new bt(0,0,re,j),ce=!1,le=new ei,ue=!1,de=!1,fe=new Qt,pe=new z,me=new bt,he={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ge=!1;function _e(){return E===null?M:1}let N=n;function ve(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:u,powerPreference:d,failIfMajorPerformanceCaveat:f};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r180`),t.addEventListener(`webglcontextlost`,Ge,!1),t.addEventListener(`webglcontextrestored`,Ke,!1),t.addEventListener(`webglcontextcreationerror`,L,!1),N===null){let t=`webgl2`;if(N=ve(t,e),N===null)throw ve(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw console.error(`THREE.WebGLRenderer: `+e.message),e}let ye,be,P,xe,F,I,Se,Ce,we,Te,Ee,De,Oe,ke,Ae,je,Me,Ne,Pe,Le,Re,ze,Be,He;function Ue(){ye=new xa(N),ye.init(),ze=new Ps(N,ye),be=new Xi(N,ye,e,ze),P=new Ms(N,ye),be.reversedDepthBuffer&&p&&P.buffers.depth.setReversed(!0),xe=new wa(N),F=new gs,I=new Ns(N,ye,P,F,be,ze,xe),Se=new Qi(S),Ce=new ba(S),we=new Hi(N),Be=new Ji(N,we),Te=new Sa(N,we,xe,Be),Ee=new Ea(N,Te,we,xe),Pe=new Ta(N,be,I),je=new Zi(F),De=new hs(S,Se,Ce,ye,be,Be,je),Oe=new Vs(S,F),ke=new bs,Ae=new Ds(ye),Ne=new qi(S,Se,Ce,P,Ee,m,s),Me=new As(S,Ee,be),He=new Hs(N,xe,be,P),Le=new Yi(N,ye,xe),Re=new Ca(N,ye,xe),xe.programs=De.programs,S.capabilities=be,S.extensions=ye,S.properties=F,S.renderLists=ke,S.shadowMap=Me,S.state=P,S.info=xe}Ue();let We=new Rs(S,N);this.xr=We,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){let e=ye.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=ye.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return M},this.setPixelRatio=function(e){e!==void 0&&(M=e,this.setSize(re,j,!1))},this.getSize=function(e){return e.set(re,j)},this.setSize=function(e,n,r=!0){if(We.isPresenting){console.warn(`THREE.WebGLRenderer: Can't change size while VR device is presenting.`);return}re=e,j=n,t.width=Math.floor(e*M),t.height=Math.floor(n*M),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(re*M,j*M).floor()},this.setDrawingBufferSize=function(e,n,r){re=e,j=n,M=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.getCurrentViewport=function(e){return e.copy(O)},this.getViewport=function(e){return e.copy(oe)},this.setViewport=function(e,t,n,r){e.isVector4?oe.set(e.x,e.y,e.z,e.w):oe.set(e,t,n,r),P.viewport(O.copy(oe).multiplyScalar(M).round())},this.getScissor=function(e){return e.copy(se)},this.setScissor=function(e,t,n,r){e.isVector4?se.set(e.x,e.y,e.z,e.w):se.set(e,t,n,r),P.scissor(k.copy(se).multiplyScalar(M).round())},this.getScissorTest=function(){return ce},this.setScissorTest=function(e){P.setScissorTest(ce=e)},this.setOpaqueSort=function(e){ie=e},this.setTransparentSort=function(e){ae=e},this.getClearColor=function(e){return e.copy(Ne.getClearColor())},this.setClearColor=function(){Ne.setClearColor(...arguments)},this.getClearAlpha=function(){return Ne.getClearAlpha()},this.setClearAlpha=function(){Ne.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(E!==null){let t=E.texture.format;e=t===1033||t===1031||t===1029}if(e){let e=E.texture.type,t=e===1009||e===1014||e===1012||e===1020||e===1017||e===1018,n=Ne.getClearColor(),r=Ne.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(h[0]=i,h[1]=a,h[2]=o,h[3]=r,N.clearBufferuiv(N.COLOR,0,h)):(_[0]=i,_[1]=a,_[2]=o,_[3]=r,N.clearBufferiv(N.COLOR,0,_))}else r|=N.COLOR_BUFFER_BIT}t&&(r|=N.DEPTH_BUFFER_BIT),n&&(r|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),N.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener(`webglcontextlost`,Ge,!1),t.removeEventListener(`webglcontextrestored`,Ke,!1),t.removeEventListener(`webglcontextcreationerror`,L,!1),Ne.dispose(),ke.dispose(),Ae.dispose(),F.dispose(),Se.dispose(),Ce.dispose(),Ee.dispose(),Be.dispose(),He.dispose(),De.dispose(),We.dispose(),We.removeEventListener(`sessionstart`,Qe),We.removeEventListener(`sessionend`,$e),B.stop()};function Ge(e){e.preventDefault(),console.log(`THREE.WebGLRenderer: Context Lost.`),C=!0}function Ke(){console.log(`THREE.WebGLRenderer: Context Restored.`),C=!1;let e=xe.autoReset,t=Me.enabled,n=Me.autoUpdate,r=Me.needsUpdate,i=Me.type;Ue(),xe.autoReset=e,Me.enabled=t,Me.autoUpdate=n,Me.needsUpdate=r,Me.type=i}function L(e){console.error(`THREE.WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function qe(e){let t=e.target;t.removeEventListener(`dispose`,qe),Je(t)}function Je(e){Ye(e),F.remove(e)}function Ye(e){let t=F.get(e).programs;t!==void 0&&(t.forEach(function(e){De.releaseProgram(e)}),e.isShaderMaterial&&De.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=he);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=dt(e,t,n,r,i);P.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Te.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Be.setup(i,r,s,n,c);let h,g=Le;if(c!==null&&(h=we.get(c),g=Re,g.setIndex(h)),i.isMesh)r.wireframe===!0?(P.setLineWidth(r.wireframeLinewidth*_e()),g.setMode(N.LINES)):g.setMode(N.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),P.setLineWidth(e*_e()),i.isLineSegments?g.setMode(N.LINES):i.isLineLoop?g.setMode(N.LINE_LOOP):g.setMode(N.LINE_STRIP)}else i.isPoints?g.setMode(N.POINTS):i.isSprite&&g.setMode(N.TRIANGLES);if(i.isBatchedMesh){if(i._multiDrawInstances!==null)at(`THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.`),g.renderMultiDrawInstances(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount,i._multiDrawInstances);else if(ye.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?we.get(c).bytesPerElement:1,o=F.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(N,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function Xe(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,ct(e,t,n),e.side=0,e.needsUpdate=!0,ct(e,t,n),e.side=2):ct(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),y=Ae.get(n),y.init(t),x.push(y),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(y.pushLight(e),e.castShadow&&y.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(y.pushLight(e),e.castShadow&&y.pushShadow(e))}),y.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t){if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];Xe(a,n,e),r.add(a)}else Xe(t,n,e),r.add(t)}}),y=x.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){F.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}ye.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let R=null;function Ze(e){R&&R(e)}function Qe(){B.stop()}function $e(){B.start()}let B=new Vi;B.setAnimationLoop(Ze),typeof self<`u`&&B.setContext(self),this.setAnimationLoop=function(e){R=e,We.setAnimationLoop(e),e===null?B.stop():B.start()},We.addEventListener(`sessionstart`,Qe),We.addEventListener(`sessionend`,$e),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){console.error(`THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(C===!0)return;if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),We.enabled===!0&&We.isPresenting===!0&&(We.cameraAutoUpdate===!0&&We.updateCamera(t),t=We.getCamera()),e.isScene===!0&&e.onBeforeRender(S,e,t,E),y=Ae.get(e,x.length),y.init(t),x.push(y),fe.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),le.setFromProjectionMatrix(fe,Ve,t.reversedDepth),de=this.localClippingEnabled,ue=je.init(this.clippingPlanes,de),v=ke.get(e,b.length),v.init(),b.push(v),We.enabled===!0&&We.isPresenting===!0){let e=S.xr.getDepthSensingMesh();e!==null&&et(e,t,-1/0,S.sortObjects)}et(e,t,0,S.sortObjects),v.finish(),S.sortObjects===!0&&v.sort(ie,ae),ge=We.enabled===!1||We.isPresenting===!1||We.hasDepthSensing()===!1,ge&&Ne.addToRenderList(v,e),this.info.render.frame++,ue===!0&&je.beginShadows();let n=y.state.shadowsArray;Me.render(n,e,t),ue===!0&&je.endShadows(),this.info.autoReset===!0&&this.info.reset();let r=v.opaque,i=v.transmissive;if(y.setupLights(),t.isArrayCamera){let n=t.cameras;if(i.length>0)for(let t=0,a=n.length;t<a;t++){let a=n[t];nt(r,i,e,a)}ge&&Ne.render(e);for(let t=0,r=n.length;t<r;t++){let r=n[t];tt(v,e,r,r.viewport)}}else i.length>0&&nt(r,i,e,t),ge&&Ne.render(e),tt(v,e,t);E!==null&&T===0&&(I.updateMultisampleRenderTarget(E),I.updateRenderTargetMipmap(E)),e.isScene===!0&&e.onAfterRender(S,e,t),Be.resetDefaultState(),D=-1,ee=null,x.pop(),x.length>0?(y=x[x.length-1],ue===!0&&je.setGlobalState(S.clippingPlanes,y.state.camera)):y=null,b.pop(),v=b.length>0?b[b.length-1]:null};function et(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)y.pushLight(e),e.castShadow&&y.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||le.intersectsSprite(e)){r&&me.setFromMatrixPosition(e.matrixWorld).applyMatrix4(fe);let t=Ee.update(e),i=e.material;i.visible&&v.push(e,t,i,n,me.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||le.intersectsObject(e))){let t=Ee.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),me.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),me.copy(e.boundingSphere.center)),me.applyMatrix4(e.matrixWorld).applyMatrix4(fe)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&v.push(e,t,s,n,me.z,o)}}else i.visible&&v.push(e,t,i,n,me.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)et(i[e],t,n,r)}function tt(e,t,n,r){let i=e.opaque,a=e.transmissive,o=e.transparent;y.setupLightsView(n),ue===!0&&je.setGlobalState(S.clippingPlanes,n),r&&P.viewport(O.copy(r)),i.length>0&&it(i,t,n),a.length>0&&it(a,t,n),o.length>0&&it(o,t,n),P.buffers.depth.setTest(!0),P.buffers.depth.setMask(!0),P.buffers.color.setMask(!0),P.setPolygonOffset(!1)}function nt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;y.state.transmissionRenderTarget[r.id]===void 0&&(y.state.transmissionRenderTarget[r.id]=new St(1,1,{generateMipmaps:!0,type:ye.has(`EXT_color_buffer_half_float`)||ye.has(`EXT_color_buffer_float`)?g:l,minFilter:c,samples:4,stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:V.workingColorSpace}));let a=y.state.transmissionRenderTarget[r.id],o=r.viewport||O;a.setSize(o.z*S.transmissionResolutionScale,o.w*S.transmissionResolutionScale);let s=S.getRenderTarget(),u=S.getActiveCubeFace(),d=S.getActiveMipmapLevel();S.setRenderTarget(a),S.getClearColor(ne),A=S.getClearAlpha(),A<1&&S.setClearColor(16777215,.5),S.clear(),ge&&Ne.render(n);let f=S.toneMapping;S.toneMapping=0;let p=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),y.setupLightsView(r),ue===!0&&je.setGlobalState(S.clippingPlanes,r),it(e,n,r),I.updateMultisampleRenderTarget(a),I.updateRenderTargetMipmap(a),ye.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let a=t[i],o=a.object,s=a.geometry,c=a.material,l=a.group;if(c.side===2&&o.layers.test(r.layers)){let t=c.side;c.side=1,c.needsUpdate=!0,st(o,n,r,s,c,l),c.side=t,c.needsUpdate=!0,e=!0}}e===!0&&(I.updateMultisampleRenderTarget(a),I.updateRenderTargetMipmap(a))}S.setRenderTarget(s,u,d),S.setClearColor(ne,A),p!==void 0&&(r.viewport=p),S.toneMapping=f}function it(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],o=a.object,s=a.geometry,c=a.group,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&st(o,t,n,s,l,c)}}function st(e,t,n,r,i,a){e.onBeforeRender(S,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(S,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,S.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,S.renderBufferDirect(n,t,r,i,e,a),i.side=2):S.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(S,t,n,r,i,a)}function ct(e,t,n){t.isScene!==!0&&(t=he);let r=F.get(e),i=y.state.lights,a=y.state.shadowsArray,o=i.state.version,s=De.getParameters(e,i.state,a,t,n),c=De.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial?t.environment:null,r.fog=t.fog,r.envMap=(e.isMeshStandardMaterial?Ce:Se).get(e.envMap||r.environment),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,qe),l=new Map,r.programs=l);let u=l.get(c);if(u!==void 0){if(r.currentProgram===u&&r.lightsStateVersion===o)return ut(e,s),u}else s.uniforms=De.getUniforms(e),e.onBeforeCompile(s,S),u=De.acquireProgram(s,c),l.set(c,u),r.uniforms=s.uniforms;let d=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(d.clippingPlanes=je.uniform),ut(e,s),r.needsLights=pt(e),r.lightsStateVersion=o,r.needsLights&&(d.ambientLightColor.value=i.state.ambient,d.lightProbe.value=i.state.probe,d.directionalLights.value=i.state.directional,d.directionalLightShadows.value=i.state.directionalShadow,d.spotLights.value=i.state.spot,d.spotLightShadows.value=i.state.spotShadow,d.rectAreaLights.value=i.state.rectArea,d.ltc_1.value=i.state.rectAreaLTC1,d.ltc_2.value=i.state.rectAreaLTC2,d.pointLights.value=i.state.point,d.pointLightShadows.value=i.state.pointShadow,d.hemisphereLights.value=i.state.hemi,d.directionalShadowMap.value=i.state.directionalShadowMap,d.directionalShadowMatrix.value=i.state.directionalShadowMatrix,d.spotShadowMap.value=i.state.spotShadowMap,d.spotLightMatrix.value=i.state.spotLightMatrix,d.spotLightMap.value=i.state.spotLightMap,d.pointShadowMap.value=i.state.pointShadowMap,d.pointShadowMatrix.value=i.state.pointShadowMatrix),r.currentProgram=u,r.uniformsList=null,u}function lt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Po.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function ut(e,t){let n=F.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function dt(e,t,n,r,i){t.isScene!==!0&&(t=he),I.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial?t.environment:null,s=E===null?S.outputColorSpace:E.isXRRenderTarget===!0?E.texture.colorSpace:Ie,c=(r.isMeshStandardMaterial?Ce:Se).get(r.envMap||o),l=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,u=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),d=!!n.morphAttributes.position,f=!!n.morphAttributes.normal,p=!!n.morphAttributes.color,m=0;r.toneMapped&&(E===null||E.isXRRenderTarget===!0)&&(m=S.toneMapping);let h=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,g=h===void 0?0:h.length,_=F.get(r),v=y.state.lights;if(ue===!0&&(de===!0||e!==ee)){let t=e===ee&&r.id===D;je.setState(r,e,t)}let b=!1;r.version===_.__version?_.needsLights&&_.lightsStateVersion!==v.state.version?b=!0:_.outputColorSpace===s?i.isBatchedMesh&&_.batching===!1||!i.isBatchedMesh&&_.batching===!0||i.isBatchedMesh&&_.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&_.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&_.instancing===!1||!i.isInstancedMesh&&_.instancing===!0||i.isSkinnedMesh&&_.skinning===!1||!i.isSkinnedMesh&&_.skinning===!0||i.isInstancedMesh&&_.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&_.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&_.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&_.instancingMorph===!1&&i.morphTexture!==null?b=!0:_.envMap===c?r.fog===!0&&_.fog!==a||_.numClippingPlanes!==void 0&&(_.numClippingPlanes!==je.numPlanes||_.numIntersection!==je.numIntersection)?b=!0:_.vertexAlphas===l&&_.vertexTangents===u&&_.morphTargets===d&&_.morphNormals===f&&_.morphColors===p&&_.toneMapping===m?_.morphTargetsCount!==g&&(b=!0):b=!0:b=!0:b=!0:(b=!0,_.__version=r.version);let x=_.currentProgram;b===!0&&(x=ct(r,t,i));let C=!1,w=!1,T=!1,O=x.getUniforms(),k=_.uniforms;if(P.useProgram(x.program)&&(C=!0,w=!0,T=!0),r.id!==D&&(D=r.id,w=!0),C||ee!==e){P.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),O.setValue(N,`projectionMatrix`,e.projectionMatrix),O.setValue(N,`viewMatrix`,e.matrixWorldInverse);let t=O.map.cameraPosition;t!==void 0&&t.setValue(N,pe.setFromMatrixPosition(e.matrixWorld)),be.logarithmicDepthBuffer&&O.setValue(N,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&O.setValue(N,`isOrthographic`,e.isOrthographicCamera===!0),ee!==e&&(ee=e,w=!0,T=!0)}if(i.isSkinnedMesh){O.setOptional(N,i,`bindMatrix`),O.setOptional(N,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),O.setValue(N,`boneTexture`,e.boneTexture,I))}i.isBatchedMesh&&(O.setOptional(N,i,`batchingTexture`),O.setValue(N,`batchingTexture`,i._matricesTexture,I),O.setOptional(N,i,`batchingIdTexture`),O.setValue(N,`batchingIdTexture`,i._indirectTexture,I),O.setOptional(N,i,`batchingColorTexture`),i._colorsTexture!==null&&O.setValue(N,`batchingColorTexture`,i._colorsTexture,I));let te=n.morphAttributes;if((te.position!==void 0||te.normal!==void 0||te.color!==void 0)&&Pe.update(i,n,x),(w||_.receiveShadow!==i.receiveShadow)&&(_.receiveShadow=i.receiveShadow,O.setValue(N,`receiveShadow`,i.receiveShadow)),r.isMeshGouraudMaterial&&r.envMap!==null&&(k.envMap.value=c,k.flipEnvMap.value=c.isCubeTexture&&c.isRenderTargetTexture===!1?-1:1),r.isMeshStandardMaterial&&r.envMap===null&&t.environment!==null&&(k.envMapIntensity.value=t.environmentIntensity),w&&(O.setValue(N,`toneMappingExposure`,S.toneMappingExposure),_.needsLights&&ft(k,T),a&&r.fog===!0&&Oe.refreshFogUniforms(k,a),Oe.refreshMaterialUniforms(k,r,M,j,y.state.transmissionRenderTarget[e.id]),Po.upload(N,lt(_),k,I)),r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Po.upload(N,lt(_),k,I),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&O.setValue(N,`center`,i.center),O.setValue(N,`modelViewMatrix`,i.modelViewMatrix),O.setValue(N,`normalMatrix`,i.normalMatrix),O.setValue(N,`modelMatrix`,i.matrixWorld),r.isShaderMaterial||r.isRawShaderMaterial){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];He.update(n,x),He.bind(n,x)}}return x}function ft(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function pt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return w},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return E},this.setRenderTargetTextures=function(e,t,n){let r=F.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),F.get(e.texture).__webglTexture=t,F.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=F.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0};let mt=N.createFramebuffer();this.setRenderTarget=function(e,t=0,n=0){E=e,w=t,T=n;let r=!0,i=null,a=!1,o=!1;if(e){let s=F.get(e);if(s.__useDefaultFramebuffer!==void 0)P.bindFramebuffer(N.FRAMEBUFFER,null),r=!1;else if(s.__webglFramebuffer===void 0)I.setupRenderTarget(e);else if(s.__hasExternalTextures)I.rebindTextures(e,F.get(e.texture).__webglTexture,F.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(s.__boundDepthTexture!==t){if(t!==null&&F.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);I.setupDepthRenderbuffer(e)}}let c=e.texture;(c.isData3DTexture||c.isDataArrayTexture||c.isCompressedArrayTexture)&&(o=!0);let l=F.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(i=Array.isArray(l[t])?l[t][n]:l[t],a=!0):i=e.samples>0&&I.useMultisampledRTT(e)===!1?F.get(e).__webglMultisampledFramebuffer:Array.isArray(l)?l[n]:l,O.copy(e.viewport),k.copy(e.scissor),te=e.scissorTest}else O.copy(oe).multiplyScalar(M).floor(),k.copy(se).multiplyScalar(M).floor(),te=ce;if(n!==0&&(i=mt),P.bindFramebuffer(N.FRAMEBUFFER,i)&&r&&P.drawBuffers(e,i),P.viewport(O),P.scissor(k),P.setScissorTest(te),a){let r=F.get(e.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(o){let r=t;for(let t=0;t<e.textures.length;t++){let i=F.get(e.textures[t]);N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=F.get(e.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,t.__webglTexture,n)}D=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=F.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){P.bindFramebuffer(N.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;if(!be.textureFormatReadable(c)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!be.textureTypeReadable(l)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&(e.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+s),N.readPixels(t,n,r,i,ze.convert(c),ze.convert(l),a))}finally{let e=E===null?null:F.get(E).__webglFramebuffer;P.bindFramebuffer(N.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=F.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){P.bindFramebuffer(N.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;if(!be.textureFormatReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!be.textureTypeReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let d=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,d),N.bufferData(N.PIXEL_PACK_BUFFER,a.byteLength,N.STREAM_READ),e.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+s),N.readPixels(t,n,r,i,ze.convert(l),ze.convert(u),0);let f=E===null?null:F.get(E).__webglFramebuffer;P.bindFramebuffer(N.FRAMEBUFFER,f);let p=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await ot(N,p,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,d),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,a),N.deleteBuffer(d),N.deleteSync(p),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;I.setTexture2D(e,0),N.copyTexSubImage2D(N.TEXTURE_2D,n,0,0,o,s,i,a),P.unbindTexture()};let ht=N.createFramebuffer(),gt=N.createFramebuffer();this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=null){a===null&&(i===0?a=0:(at(`WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.`),a=i,i=0));let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=ze.convert(t.format),_=ze.convert(t.type),v;t.isData3DTexture?(I.setTexture3D(t,0),v=N.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(I.setTexture2DArray(t,0),v=N.TEXTURE_2D_ARRAY):(I.setTexture2D(t,0),v=N.TEXTURE_2D),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,t.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,t.unpackAlignment);let y=N.getParameter(N.UNPACK_ROW_LENGTH),b=N.getParameter(N.UNPACK_IMAGE_HEIGHT),x=N.getParameter(N.UNPACK_SKIP_PIXELS),S=N.getParameter(N.UNPACK_SKIP_ROWS),C=N.getParameter(N.UNPACK_SKIP_IMAGES);N.pixelStorei(N.UNPACK_ROW_LENGTH,h.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,h.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,l),N.pixelStorei(N.UNPACK_SKIP_ROWS,u),N.pixelStorei(N.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=F.get(e),r=F.get(t),h=F.get(n.__renderTarget),g=F.get(r.__renderTarget);P.bindFramebuffer(N.READ_FRAMEBUFFER,h.__webglFramebuffer),P.bindFramebuffer(N.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,F.get(e).__webglTexture,i,d+n),N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,F.get(t).__webglTexture,a,m+n)),N.blitFramebuffer(l,u,o,s,f,p,o,s,N.DEPTH_BUFFER_BIT,N.NEAREST);P.bindFramebuffer(N.READ_FRAMEBUFFER,null),P.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||F.has(e)){let n=F.get(e),r=F.get(t);P.bindFramebuffer(N.READ_FRAMEBUFFER,ht),P.bindFramebuffer(N.DRAW_FRAMEBUFFER,gt);for(let e=0;e<c;e++)w?N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):N.framebufferTexture2D(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,n.__webglTexture,i),T?N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):N.framebufferTexture2D(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,r.__webglTexture,a),i===0?T?N.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):N.copyTexSubImage2D(v,a,f,p,l,u,o,s):N.blitFramebuffer(l,u,o,s,f,p,o,s,N.COLOR_BUFFER_BIT,N.NEAREST);P.bindFramebuffer(N.READ_FRAMEBUFFER,null),P.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?N.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?N.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):N.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):N.texSubImage2D(N.TEXTURE_2D,a,f,p,o,s,g,_,h);N.pixelStorei(N.UNPACK_ROW_LENGTH,y),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,b),N.pixelStorei(N.UNPACK_SKIP_PIXELS,x),N.pixelStorei(N.UNPACK_SKIP_ROWS,S),N.pixelStorei(N.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&N.generateMipmap(v),P.unbindTexture()},this.initRenderTarget=function(e){F.get(e).__webglFramebuffer===void 0&&I.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?I.setTextureCube(e,0):e.isData3DTexture?I.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?I.setTexture2DArray(e,0):I.setTexture2D(e,0),P.unbindTexture()},this.resetState=function(){w=0,T=0,E=null,P.reset(),Be.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return Ve}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=V._getDrawingBufferColorSpace(e),t.unpackColorSpace=V._getUnpackColorSpace()}},G={outline:`#2b1d1e`,ink:`#3a2a26`,shadow:`rgba(30, 20, 30, 0.28)`,grass1:`#7cb356`,grass2:`#6aa24a`,grass3:`#8cc463`,grassDark:`#4f8a3c`,grassDeep:`#3f7336`,path1:`#d9b27c`,path2:`#c79c66`,path3:`#e6c592`,cobble1:`#b9ab98`,cobble2:`#a39381`,cobble3:`#cfc2ae`,water1:`#4f9fcf`,water2:`#6fb8de`,water3:`#3c86b8`,waterEdge:`#9ad1e8`,soil1:`#7a4f33`,soil2:`#65402a`,soil3:`#8e5f3f`,wood1:`#a0643c`,wood2:`#84502f`,wood3:`#bd7c4c`,woodDark:`#5c3822`,brick1:`#c0674a`,brick2:`#a4553d`,plaster:`#f1e3c6`,plaster2:`#dfcdab`,roofRed1:`#b8483e`,roofRed2:`#963a33`,roofBlue1:`#4e6fa3`,roofBlue2:`#3e5a88`,roofGreen1:`#5a8a4e`,roofGreen2:`#46703e`,roofBrown1:`#8a5a3a`,roofBrown2:`#6e472e`,glass1:`#bfe6ee`,glass2:`#98d0de`,glassFrame:`#f4f1e8`,leaf1:`#3f8a3a`,leaf2:`#56a347`,leaf3:`#76bf5a`,leaf4:`#2e6b31`,trunk:`#7a4c2c`,flowerRed:`#e0574f`,flowerYellow:`#f2c94c`,flowerWhite:`#f7f3ea`,flowerPink:`#ef8fb1`,flowerPurple:`#9d7ad6`,flowerBlue:`#6ea5e6`,metal:`#5b5f6b`,metalLight:`#8f95a3`,lampGlow:`#ffe7a3`,windowLit:`#ffd88a`,windowDark:`#35506b`,paper:`#f6ecd3`,paper2:`#e7d8b4`,gold:`#f2b53a`,gold2:`#c98c1f`,white:`#fdfbf5`},Ws=[{id:`skin1`,name:`Deep`,base:`#5a3825`,shade:`#462a1b`},{id:`skin2`,name:`Dark brown`,base:`#7a4a2e`,shade:`#633b23`},{id:`skin3`,name:`Brown`,base:`#9c6440`,shade:`#834f31`},{id:`skin4`,name:`Warm tan`,base:`#c08a5c`,shade:`#a47049`},{id:`skin5`,name:`Light tan`,base:`#dcaa7e`,shade:`#c38f65`},{id:`skin6`,name:`Light`,base:`#f0c9a4`,shade:`#d9ab86`}],Gs=[{id:`black`,name:`Black`,base:`#2a1f1d`,shade:`#1a1312`,light:`#433331`},{id:`darkbrown`,name:`Dark brown`,base:`#4a2f22`,shade:`#352016`,light:`#664335`},{id:`brown`,name:`Brown`,base:`#7a4a2a`,shade:`#5d371e`,light:`#96603a`},{id:`auburn`,name:`Auburn`,base:`#9c4a2c`,shade:`#7a3620`,light:`#bd6440`},{id:`blonde`,name:`Blonde`,base:`#d9b061`,shade:`#b88f45`,light:`#ecc97e`},{id:`gray`,name:`Silver`,base:`#b9b7b4`,shade:`#8f8c89`,light:`#dedbd6`}],Ks=[{id:`red`,name:`Tomato red`,base:`#c9483f`,shade:`#a2362f`},{id:`orange`,name:`Pumpkin`,base:`#e0823a`,shade:`#bb652a`},{id:`yellow`,name:`Sunflower`,base:`#e8bd3f`,shade:`#c29a2c`},{id:`green`,name:`Leaf green`,base:`#4f9a4a`,shade:`#3c7b39`},{id:`teal`,name:`Pond teal`,base:`#2f9a94`,shade:`#237872`},{id:`blue`,name:`Sky blue`,base:`#4b7fcf`,shade:`#3a64a6`},{id:`purple`,name:`Violet`,base:`#8a5cc4`,shade:`#6d469e`},{id:`pink`,name:`Blossom`,base:`#dc6f9c`,shade:`#b8567f`}],qs=[{id:`short`,name:`Short`},{id:`curly`,name:`Curly`},{id:`puffs`,name:`Puffs`},{id:`braids`,name:`Braids`},{id:`long`,name:`Long`},{id:`locs`,name:`Locs`}],Js=[{id:`none`,name:`None`},{id:`glasses`,name:`Glasses`},{id:`sunhat`,name:`Sun hat`},{id:`cap`,name:`Cap`},{id:`headband`,name:`Headband`},{id:`scarf`,name:`Scarf`}];function Ys(e){"@babel/helpers - typeof";return Ys=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},Ys(e)}function Xs(e,t){if(Ys(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(Ys(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function Zs(e){var t=Xs(e,`string`);return Ys(t)==`symbol`?t:t+``}function K(e,t,n){return(t=Zs(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var q=class e{constructor(e,t){K(this,`w`,void 0),K(this,`h`,void 0),K(this,`px`,void 0),this.w=e,this.h=t,this.px=Array(e*t).fill(null)}get(e,t){return e<0||t<0||e>=this.w||t>=this.h?null:this.px[t*this.w+e]}set(e,t,n){e=Math.round(e),t=Math.round(t),!(e<0||t<0||e>=this.w||t>=this.h)&&(this.px[t*this.w+e]=n)}rect(e,t,n,r,i){for(let a=0;a<r;a++)for(let r=0;r<n;r++)this.set(e+r,t+a,i)}hline(e,t,n,r){for(let i=e;i<=t;i++)this.set(i,n,r)}vline(e,t,n,r){for(let i=t;i<=n;i++)this.set(e,i,r)}ellipse(e,t,n,r,i){let a=e+n/2-.5,o=t+r/2-.5,s=n/2,c=r/2;for(let l=0;l<r;l++)for(let r=0;r<n;r++){let n=(e+r-a)/s,u=(t+l-o)/c;n*n+u*u<=1&&this.set(e+r,t+l,i)}}shadeWhere(e,t){for(let n=0;n<this.h;n++)for(let r=0;r<this.w;r++){let i=this.get(r,n);i&&e(r,n,i)&&this.set(r,n,t)}}outline(e=G.outline){let t=[];for(let e=0;e<this.h;e++)for(let n=0;n<this.w;n++)this.get(n,e)||(this.get(n-1,e)||this.get(n+1,e)||this.get(n,e-1)||this.get(n,e+1))&&t.push(e*this.w+n);return t.forEach(t=>this.px[t]=e),this}flipX(){let t=new e(this.w,this.h);for(let e=0;e<this.h;e++)for(let n=0;n<this.w;n++)t.set(this.w-1-n,e,this.get(n,e));return t}blit(e,t,n){for(let r=0;r<e.h;r++)for(let i=0;i<e.w;i++){let a=e.get(i,r);a&&this.set(t+i,n+r,a)}}drawTo(e,t,n,r=1){for(let i=0;i<this.h;i++)for(let a=0;a<this.w;a++){let o=this.get(a,i);o&&(e.fillStyle=o,e.fillRect(t+a*r,n+i*r,r,r))}}toCanvas(e=1){let t=document.createElement(`canvas`);t.width=this.w*e,t.height=this.h*e;let n=t.getContext(`2d`);return this.drawTo(n,0,0,e),t}toDataURL(e=1){return this.toCanvas(e).toDataURL(`image/png`)}};function J(e,t,n){let r=parseInt(e.slice(1),16),i=parseInt(t.slice(1),16),a=Math.round((r>>16&255)*(1-n)+(i>>16&255)*n),o=Math.round((r>>8&255)*(1-n)+(i>>8&255)*n),s=Math.round((r&255)*(1-n)+(i&255)*n);return`#`+(1<<24|a<<16|o<<8|s).toString(16).slice(1)}var Qs=[`down`,`left`,`right`,`up`],$s={skin:`skin2`,hairStyle:`puffs`,hairColor:`black`,outfit:`teal`,accessory:`none`};function ec(e){let t=Ws.find(t=>t.id===e.skin)??Ws[1],n=Gs.find(t=>t.id===e.hairColor)??Gs[0],r=Ks.find(t=>t.id===e.outfit)??Ks[4],i=r.id===`yellow`?`#2f9a94`:G.flowerYellow;return{build:`kid`,skin:{base:t.base,shade:t.shade},hair:{style:e.hairStyle,base:n.base,shade:n.shade,light:n.light},shirt:{base:r.base,shade:r.shade},pants:`#3f4a6b`,shoes:`#5a3a2a`,accessory:e.accessory,accent:i}}function tc(e){return e===`adult`?{H:28,torsoTop:13,torsoBot:19,pantsTop:20,legTop:21,legBot:25,shoeY:26,sleeveRows:5,handRows:2}:{H:24,torsoTop:13,torsoBot:17,pantsTop:18,legTop:19,legBot:21,shoeY:22,sleeveRows:3,handRows:2}}function nc(e,t,n){if(t===`left`)return nc(e,`right`,n).flipX();let r=tc(e.build),i=new q(16,r.H);return t===`right`?ic(i,e,r,n):rc(i,e,r,n,t===`up`),sc(i,e,t),ac(i,e,t),cc(i,e,t),lc(i,e,t),e.extras?.lantern&&uc(i,t,r,n),i.outline(),i}function rc(e,t,n,r,i){let a=r===1?[1,0]:r===2?[0,1]:[0,0],o=r===1?[1,-1]:r===2?[-1,1]:[0,0],s=J(t.pants,G.outline,.3);e.rect(5,n.legTop,2,n.legBot-n.legTop+1-a[0],t.pants),e.rect(9,n.legTop,2,n.legBot-n.legTop+1-a[1],t.pants),e.set(6,n.legTop,s),e.hline(4,6,n.shoeY-a[0],t.shoes),e.hline(9,11,n.shoeY-a[1],t.shoes);let c=t.extras?.jacket??t.shirt;e.rect(4,n.pantsTop,8,1,t.pants),e.rect(4,n.torsoTop,8,n.torsoBot-n.torsoTop+1,c.base),e.vline(11,n.torsoTop+1,n.torsoBot,c.shade),e.hline(4,11,n.torsoBot,c.shade),[3,12].forEach((r,i)=>{let a=n.torsoTop+Math.max(0,o[i]);e.rect(r,a,1,n.sleeveRows,i===1?c.shade:c.base),e.rect(r,a+n.sleeveRows,1,n.handRows-+(o[i]<0),t.skin.base)});let l=t.extras;i?l?.apron&&(e.set(7,n.torsoTop+1,l.apron),e.set(8,n.torsoTop+2,l.apron)):(l?.jacket?(e.hline(6,9,n.torsoTop,G.white),e.vline(6,n.torsoTop+1,n.torsoTop+2,G.white),e.vline(9,n.torsoTop+1,n.torsoTop+2,G.white),l.tie&&e.rect(7,n.torsoTop+1,2,4,l.tie),l.lapelFlower&&(e.set(4,n.torsoTop+1,l.lapelFlower),e.set(5,n.torsoTop+1,J(l.lapelFlower,G.white,.45)),e.set(5,n.torsoTop+2,l.lapelFlower),e.set(4,n.torsoTop+2,G.leaf2))):(e.set(7,n.torsoTop,t.skin.shade),e.set(8,n.torsoTop,t.skin.shade)),l?.apron&&(e.rect(5,n.torsoTop+2,6,n.pantsTop-n.torsoTop,l.apron),e.set(5,n.torsoTop+1,l.apron),e.set(10,n.torsoTop+1,l.apron),e.hline(6,9,n.torsoTop+4,J(l.apron,G.outline,.2))))}function ic(e,t,n,r){let i=J(t.pants,G.outline,.3),a=J(t.shoes,G.outline,.3),o=n.legBot-n.legTop+1,s=r===1?{near:9,far:5}:r===2?{near:5,far:9}:{near:7,far:6};e.rect(s.far,n.legTop,2,o,i),e.hline(s.far,s.far+2,n.shoeY,a),e.rect(s.near,n.legTop,2,o,t.pants),e.hline(s.near,s.near+2,n.shoeY,t.shoes);let c=t.extras?.jacket??t.shirt;e.rect(5,n.pantsTop,6,1,t.pants),e.rect(5,n.torsoTop,6,n.torsoBot-n.torsoTop+1,c.base),e.vline(5,n.torsoTop,n.torsoBot,c.shade);let l=t.extras;l?.jacket&&(e.vline(10,n.torsoTop,n.torsoTop+2,G.white),l.tie&&e.vline(10,n.torsoTop+1,n.torsoTop+3,l.tie),l.lapelFlower&&(e.set(9,n.torsoTop+1,l.lapelFlower),e.set(9,n.torsoTop+2,G.leaf2))),l?.apron&&e.rect(9,n.torsoTop+2,2,n.pantsTop-n.torsoTop,l.apron);let u=r===1?6:r===2?9:7;e.rect(u,n.torsoTop,2,n.sleeveRows,c.shade),e.rect(u,n.torsoTop+n.sleeveRows,2,n.handRows,t.skin.base)}function ac(e,t,n){let r=t.skin;if(e.rect(3,4,10,9,r.base),e.set(3,4,null),e.set(12,4,null),e.set(3,12,null),e.set(12,12,null),e.hline(4,11,12,r.shade),n===`down`){e.vline(12,6,11,r.shade),e.set(2,8,r.base),e.set(13,8,r.shade),e.vline(5,8,9,G.outline),e.vline(10,8,9,G.outline);let n=J(r.shade,G.outline,.35);e.set(7,11,n),e.set(8,11,n),t.extras?.mustache&&e.hline(5,10,10,t.extras.mustache),t.extras?.beard&&(e.hline(4,11,11,t.extras.beard),e.hline(5,10,12,t.extras.beard))}else n===`right`?(e.set(13,9,r.base),e.vline(10,8,9,G.outline),e.set(11,11,J(r.shade,G.outline,.35)),e.rect(7,8,1,2,r.shade),t.extras?.mustache&&e.hline(10,12,10,t.extras.mustache),t.extras?.beard&&(e.hline(7,12,11,t.extras.beard),e.hline(8,11,12,t.extras.beard))):(e.set(2,8,r.base),e.set(13,8,r.base))}function oc(e,t,n,r,i,a){for(let o=n;o<=i;o++)for(let n=t;n<=r;n++)e.get(n,o)===a.base&&((n*3+o*5)%7==0?e.set(n,o,a.shade):(n+o*2)%11==0&&o<5&&e.set(n,o,a.light))}function sc(e,t,n){let r=t.hair,i=n===`right`;switch(r.style){case`curly`:n===`up`?e.ellipse(1,1,14,12,r.base):i?e.ellipse(2,1,11,11,r.base):e.ellipse(1,1,14,11,r.base);break;case`long`:n===`down`?(e.rect(2,5,2,10,r.base),e.rect(12,5,2,10,r.base),e.vline(2,6,14,r.shade)):i&&e.rect(2,5,5,11,r.base);break;case`locs`:if(n===`down`)for(let t of[1,2,3,12,13,14])e.vline(t,5,15-t%2,t%2?r.shade:r.base);else if(i)for(let t=2;t<=6;t++)e.vline(t,5,16-t%2,t%2?r.shade:r.base);break;case`braids`:if(n===`down`){for(let t of[1,13])for(let n=6;n<=16;n++)e.rect(t,n,2,1,n%2?r.base:r.shade);e.rect(1,17,2,1,t.accent),e.rect(13,17,2,1,t.accent)}else if(i){for(let t=6;t<=17;t++)e.rect(3,t,2,1,t%2?r.base:r.shade);e.rect(3,18,2,1,t.accent)}}}function cc(e,t,n){let r=t.hair,i=n===`right`,a=()=>{e.hline(4,11,3,r.base),e.rect(3,4,10,2,r.base),e.hline(5,6,4,r.light)},o=()=>{a(),e.rect(3,6,10,6,r.base),e.hline(4,11,11,r.shade)},s=()=>{e.hline(5,11,3,r.base),e.rect(3,4,10,2,r.base),e.rect(3,6,4,5,r.base),e.set(11,6,r.base),e.set(12,6,r.base),e.hline(6,8,4,r.light)};switch(r.style){case`wrap`:{let r=t.accent,a=J(r,G.outline,.25);e.hline(4,11,2,r),e.rect(3,3,10,3,r),e.hline(3,12,5,a),n===`up`&&e.rect(3,6,10,4,r),i&&e.rect(3,6,4,4,r),e.rect(7,1,3,2,a);return}case`carver`:n===`up`?(e.rect(4,4,8,7,r.base),e.hline(4,11,3,r.base),e.vline(3,6,10,r.base),e.vline(12,6,10,r.base)):i?(e.hline(5,10,3,r.base),e.rect(3,4,6,2,r.base),e.rect(3,6,3,5,r.base)):(e.hline(5,10,3,r.base),e.hline(4,11,4,r.base),e.vline(3,5,8,r.base),e.vline(12,5,8,r.base),e.set(7,4,r.light));return;case`bun`:n===`up`?o():i?s():(a(),e.vline(3,6,8,r.base),e.vline(12,6,8,r.base)),e.ellipse(6,0,4,4,r.base),e.set(7,1,r.light);return;case`curly`:if(n===`up`){oc(e,1,1,14,12,r);return}if(i){e.ellipse(3,1,10,6,r.base),e.rect(3,5,4,6,r.base),oc(e,2,1,13,11,r);return}e.ellipse(2,1,12,7,r.base),e.vline(3,6,9,r.base),e.vline(12,6,9,r.base),e.set(6,6,null),oc(e,1,1,14,11,r),e.rect(4,6,8,1,t.skin.base);return}if(n===`up`){if(o(),r.style===`long`&&(e.rect(3,12,10,5,r.base),e.vline(7,12,16,r.shade)),r.style===`locs`)for(let t=3;t<=12;t++)e.vline(t,12,17-t%2,t%2?r.shade:r.base);if(r.style===`braids`){for(let t of[5,9])for(let n=12;n<=17;n++)e.rect(t,n,2,1,n%2?r.base:r.shade);e.rect(5,18,2,1,t.accent),e.rect(9,18,2,1,t.accent)}}else i?s():(a(),e.vline(3,6,7,r.base),e.vline(12,6,7,r.base),e.hline(4,6,6,r.base),e.set(11,6,r.base));r.style===`puffs`&&(i?(e.ellipse(1,1,5,5,r.base),e.set(2,2,r.light)):(e.ellipse(1,1,5,5,r.base),e.ellipse(10,1,5,5,r.base),e.set(2,2,r.light),e.set(11,2,r.light)))}function lc(e,t,n){let r=t.accessory,i=t.accent,a=J(i,G.outline,.3),o=n===`right`;switch(r){case`glasses`:{let t=`#39364a`,r=`#cfe8f0`;n===`down`?(e.hline(4,6,7,t),e.hline(9,11,7,t),e.set(4,8,t),e.set(6,8,t),e.set(9,8,t),e.set(11,8,t),e.hline(7,8,8,t),e.set(5,8,r),e.set(10,8,r)):o&&(e.hline(9,11,7,t),e.set(11,8,t),e.set(9,8,t),e.hline(6,8,8,t),e.set(10,8,r));break}case`sunhat`:{let t=`#e2c27a`,n=`#c7a55c`;e.hline(1,14,4,t),e.hline(2,13,5,n),e.rect(4,1,8,3,t),e.hline(4,11,3,i),e.set(5,1,n);break}case`cap`:e.hline(4,11,2,i),e.rect(3,3,10,2,i),e.set(7,2,G.white),n===`down`?e.hline(3,12,5,a):o&&e.hline(10,14,5,a);break;case`headband`:e.hline(3,12,5,i),n===`down`&&e.set(10,5,G.white);break;case`scarf`:e.hline(3,12,12,i),e.hline(4,11,13,a),n===`down`&&e.rect(10,14,2,2,i),o&&e.rect(4,14,2,2,i)}}function uc(e,t,n,r){if(t===`up`)return;let i=t===`right`?11:13,a=n.torsoTop+n.sleeveRows+n.handRows-+(r===0);e.set(i,a,G.metal),e.rect(i,a+1,2,3,G.lampGlow),e.set(i+1,a+1,G.windowLit),e.hline(i,i+1,a+4,G.metal)}function dc(e){let t=tc(e.build).H,n=document.createElement(`canvas`);n.width=48,n.height=t*Qs.length;let r=n.getContext(`2d`);return Qs.forEach((n,i)=>{for(let a=0;a<3;a++)nc(e,n,a).drawTo(r,a*16,i*t)}),n}function fc(e){return tc(e.build).H}function pc(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function mc(e,t,n=1){let r=e*374761393+t*668265263+n*2147483647>>>0;return r=Math.imul(r^r>>>13,1274126177)>>>0,((r^r>>>16)>>>0)/4294967296}var hc={".":`grass`,p:`path`,c:`cobble`,w:`water`,s:`soil`,f:`field`,d:`dryfield`,"*":`flowers`,o:`floor`,r:`rug`,"#":`wall`};function gc(e){return e.map(e=>e.split(``).map(e=>hc[e]??`grass`))}function _c(){let e=Array.from({length:30},()=>Array(40).fill(`grass`)),t=(t,n,r,i,a)=>{for(let o=r;o<=a;o++)for(let r=n;r<=i;r++)e[o][r]=t};return t(`soil`,9,3,13,6),t(`field`,31,3,36,6),t(`path`,19,6,20,8),t(`path`,11,7,12,8),t(`path`,33,7,34,8),t(`path`,11,9,34,10),t(`path`,11,9,12,27),t(`path`,27,9,28,27),t(`path`,3,26,36,27),t(`cobble`,14,12,25,16),t(`cobble`,19,11,20,11),t(`cobble`,13,14,13,15),t(`cobble`,26,14,26,15),t(`path`,5,17,5,18),t(`path`,5,18,10,18),t(`path`,29,19,36,19),t(`path`,33,17,33,18),t(`path`,6,25,6,25),t(`path`,33,25,33,25),t(`path`,19,17,20,18),t(`water`,17,19,22,19),t(`water`,16,20,23,21),t(`water`,17,22,22,22),t(`flowers`,2,9,3,9),t(`flowers`,21,8,24,8),t(`flowers`,15,24,17,24),t(`flowers`,22,24,24,24),t(`flowers`,36,11,37,12),t(`flowers`,4,19,4,19),e}function vc(){let e=[];for(let t=0;t<40;t++)for(let n of[0,1,28,29])e.push({kind:(t+n)%3==0?`pine`:`tree`,x:t,y:n,variant:(t*7+n)%3});for(let t=2;t<28;t++)for(let n of[0,1,38,39])e.push({kind:(n+t)%3==0?`pine`:`tree`,x:n,y:t,variant:(n+t*5)%3});[[3,3],[5,5],[3,7],[25,3],[26,6],[15,5],[3,10],[9,13],[37,14],[10,21],[29,21],[37,22],[14,24],[25,24],[37,25]].forEach(([t,n],r)=>e.push({kind:r%4==0?`pine`:`tree`,x:t,y:n,variant:r%3})),[[7,8],[15,8],[24,7],[13,18],[26,18],[4,18],[37,19],[9,16]].forEach(([t,n],r)=>e.push({kind:`bush`,x:t,y:n,variant:r%2}));for(let t=8;t<=14;t++)e.push({kind:`fence`,x:t,y:2}),(t<11||t>13)&&e.push({kind:`fence`,x:t,y:7});for(let t=3;t<=6;t++)e.push({kind:`fence`,x:8,y:t}),e.push({kind:`fence`,x:14,y:t});for(let t=9;t<=13;t++)for(let n of[3,5])e.push({kind:`crop`,x:t,y:n,variant:(t+n)%3,solid:!1});for(let t=30;t<=37;t++)e.push({kind:`fence`,x:t,y:2}),(t<32||t>34)&&e.push({kind:`fence`,x:t,y:7});for(let t=3;t<=6;t++)e.push({kind:`fence`,x:30,y:t}),e.push({kind:`fence`,x:37,y:t});for(let t=31;t<=36;t++)for(let n of[4,6])t!==35&&e.push({kind:`crop`,x:t,y:n,variant:3,solid:!1});e.push({kind:`scarecrow`,x:35,y:5}),e.push({kind:`potting`,x:9,y:8}),e.push({kind:`well`,x:19,y:13}),e.push({kind:`bench`,x:16,y:11}),e.push({kind:`bench`,x:23,y:11}),[[10,8],[29,8],[13,11],[26,11],[13,17],[26,17],[10,25],[29,25],[18,18],[21,18]].forEach(([t,n])=>e.push({kind:`lamp`,x:t,y:n})),e.push({kind:`stall`,x:34,y:18}),e.push({kind:`mailbox`,x:30,y:18}),e.push({kind:`crate`,x:36,y:18}),e.push({kind:`barrel`,x:37,y:18});for(let[t,n]of[[15,21],[24,20],[24,21],[16,22]])e.push({kind:`reeds`,x:t,y:n,solid:!1});return e.push({kind:`sign`,x:18,y:7,text:`Carver's Greenhouse.`}),e.push({kind:`sign`,x:13,y:7,text:`Community Garden. A lesson grows here in Chapter 1.`}),e.push({kind:`sign`,x:32,y:7,text:`Hilltop Farm. Open for lessons in Chapters 3 and 5.`}),e.push({kind:`sign`,x:9,y:17,text:`Your cottage. Rest, change your look and check your windowsill.`}),e.push({kind:`sign`,x:29,y:17,text:`Seed & Mail. Seeds, letters and parcels.`}),e.push({kind:`sign`,x:8,y:25,text:`Schoolhouse. Opens in Chapter 2.`}),e.push({kind:`sign`,x:31,y:25,text:`Workshop. Opens in Chapter 4.`}),e.push({kind:`sign`,x:17,y:18,text:`Sweetgum Pond. Please do not feed the ducks bread.`}),e}var yc=[{id:`greenhouse`,label:`Carver's Greenhouse`,x:16,y:3,w:8,d:3,h:2.5,style:`greenhouse`,roof:`glass`,doorX:19},{id:`cottage`,label:`Your cottage`,x:3,y:14,w:6,d:3,h:2.5,style:`cottage`,roof:`red`,doorX:5},{id:`seedmail`,label:`Seed & Mail`,x:31,y:14,w:6,d:3,h:2.5,style:`shop`,roof:`green`,doorX:33},{id:`school`,label:`Schoolhouse`,x:3,y:22,w:7,d:3,h:2.5,style:`school`,roof:`blue`,doorX:6},{id:`workshop`,label:`Workshop`,x:30,y:23,w:7,d:2,h:2.5,style:`workshop`,roof:`brown`,doorX:33}];function bc(){return{id:`hub`,w:40,h:30,ground:_c(),buildings:yc,props:vc(),places:[{id:`cottage_door`,label:`Enter your cottage`,x:5.5,y:17.4,radius:1.1},{id:`school_door`,label:`Schoolhouse door`,x:6.5,y:25.4,radius:1.1},{id:`workshop_door`,label:`Workshop door`,x:33.5,y:25.4,radius:1.1},{id:`greenhouse_door`,label:`Greenhouse door`,x:19.9,y:6.4,radius:1.1},{id:`shop_door`,label:`Seed & Mail door`,x:33.5,y:17.4,radius:.8},{id:`farm_door`,label:`Hilltop Farm gate`,x:33.9,y:7.6,radius:1}],spawn:{x:5.5,y:18.5},blocked:new Set}}var xc=[`##########`,`##########`,`#oooooooo#`,`#oooooooo#`,`#ooorrooo#`,`#ooorrooo#`,`#oooooooo#`,`#oooooooo#`,`####oo####`];function Sc(){let e=new Set;return[`1,2`,`2,2`,`1,3`,`2,3`,`4,2`,`6,2`,`7,2`,`8,2`,`1,7`].forEach(t=>e.add(t)),{id:`room`,w:10,h:9,ground:gc(xc),buildings:[],props:[],places:[{id:`bed`,label:`Rest in bed`,x:2,y:3.9,radius:1.2},{id:`wardrobe`,label:`Change your look`,x:4.5,y:3.1,radius:1},{id:`shelf`,label:`Look at the shelf`,x:6.5,y:3.1,radius:1},{id:`windowsill`,label:`Look at the windowsill`,x:8,y:3.1,radius:1.1},{id:`room_door`,label:`Go outside`,x:5,y:8.3,radius:1.1}],spawn:{x:5,y:7.2},blocked:e,entry:{x:5,y:7.2},exit:{x0:4,x1:6,y:8.05,to:`hub`,at:{x:5.5,y:18.5}}}}var Cc=[`##############`,`##############`,`#oooooooooooo#`,`#oooooooooooo#`,`#oooooooooooo#`,`#ooooorrooooo#`,`#oooooooooooo#`,`#oooooooooooo#`,`######oo######`],wc=[[2,2],[11,2],[1,4],[12,4],[1,6],[12,6]],Tc=[`ch2-reading`,`ch2-neosho`,`ch2-kansas`,`ch2-highland`,`ch2-simpson`,`ch2-iowastate`];function Ec(){let e=new Set;return[`3,4`,`4,4`,`9,4`,`10,4`,`3,6`,`4,6`,`9,6`,`10,6`].forEach(t=>e.add(t)),wc.forEach(([t,n])=>e.add(`${t},${n}`)),{id:`school`,w:14,h:9,ground:gc(Cc),buildings:[],props:[],places:[{id:`school_exit`,label:`Go outside`,x:7,y:8.3,radius:1.1}],spawn:{x:7,y:7.3},blocked:e,entry:{x:7,y:7.3},exit:{x0:6,x1:8,y:8.05,to:`hub`,at:{x:6.5,y:26.4}}}}var Dc=[`................`,`................`,`................`,`..dddddppfffff..`,`..dddddppfffff..`,`..dddddppfffff..`,`..dddddppfffff..`,`.......pp.......`,`..pppppppppppp..`,`.......pp.......`,`.......pp.......`,`.......pp.......`],Oc={west:{x0:2,y0:3,x1:6,y1:6},east:{x0:9,y0:3,x1:13,y1:6}};function kc(){let e=[];for(let t=0;t<16;t++)e.push({kind:t%3==0?`pine`:`tree`,x:t,y:0,variant:t%3});for(let t=1;t<12;t++)for(let n of[0,15])e.push({kind:(n+t)%3==0?`pine`:`tree`,x:n,y:t,variant:(n+t)%3});for(let t=1;t<15;t++)(t<6||t>9)&&e.push({kind:t%2?`bush`:`tree`,x:t,y:11,variant:t%2});for(let t=Oc.west.x0;t<=Oc.west.x1;t++)e.push({kind:`fence`,x:t,y:2});for(let t=Oc.east.x0;t<=Oc.east.x1;t++)e.push({kind:`fence`,x:t,y:2});for(let t=Oc.west.x0;t<=Oc.west.x1;t++)for(let n of[4,6])e.push({kind:`crop`,x:t,y:n,variant:4,solid:!1});for(let t=Oc.east.x0;t<=Oc.east.x1;t++)e.push({kind:`crop`,x:t,y:4,variant:6,solid:!1}),e.push({kind:`crop`,x:t,y:6,variant:5,solid:!1});return e.push({kind:`potting`,x:7,y:2}),e.push({kind:`scarecrow`,x:14,y:4}),e.push({kind:`crate`,x:5,y:1}),e.push({kind:`barrel`,x:10,y:1}),e.push({kind:`sign`,x:1,y:7,text:`West plot. Cotton, five years in a row.`}),e.push({kind:`sign`,x:14,y:7,text:`East plot. Cotton, peanuts, cotton, cowpeas, cotton.`}),{id:`farm`,w:16,h:12,ground:gc(Dc),buildings:[],props:e,places:[{id:`farm_exit`,label:`Back to town`,x:7.9,y:11.3,radius:1.1}],spawn:{x:7.9,y:10.2},blocked:new Set,entry:{x:7.9,y:10.2},exit:{x0:7,x1:9,y:11.05,to:`hub`,at:{x:33.9,y:8.6}}}}function Ac(e,t=7){let n=document.createElement(`canvas`);n.width=e.w*16,n.height=e.h*16;let r=n.getContext(`2d`),i=(t,n)=>t<0||n<0||t>=e.w||n>=e.h?null:e.ground[n][t],a=(e,t,n)=>{r.fillStyle=n,r.fillRect(e,t,1,1)};for(let n=0;n<e.h;n++)for(let o=0;o<e.w;o++){let s=e.ground[n][o],c=o*16,l=n*16,u=e=>mc(o*31+e,n*17+e*3,t);switch(s){case`grass`:case`flowers`:r.fillStyle=jc(u(0)),r.fillRect(c,l,16,16);for(let e=0;e<6;e++){let t=c+Math.floor(u(e+1)*15),n=l+Math.floor(u(e+9)*14)+1;a(t,n,G.grass2),a(t+1,n-1,G.grass2)}for(let e=0;e<3;e++)a(c+Math.floor(u(e+20)*16),l+Math.floor(u(e+30)*16),G.grass3);if(s===`flowers`||u(40)>.9){let e=[G.flowerRed,G.flowerYellow,G.flowerWhite,G.flowerPink,G.flowerPurple,G.flowerBlue],t=s===`flowers`?5:1;for(let n=0;n<t;n++){let t=c+2+Math.floor(u(n+50)*12),r=l+2+Math.floor(u(n+60)*12),i=e[Math.floor(u(n+70)*e.length)];a(t,r-1,i),a(t-1,r,i),a(t+1,r,i),a(t,r+1,i),a(t,r,G.flowerYellow===i?G.flowerWhite:G.flowerYellow)}}break;case`path`:r.fillStyle=G.path1,r.fillRect(c,l,16,16);for(let e=0;e<7;e++)a(c+Math.floor(u(e)*16),l+Math.floor(u(e+7)*16),e%3?G.path2:G.path3);break;case`cobble`:r.fillStyle=G.cobble2,r.fillRect(c,l,16,16);for(let e=0;e<4;e++){let i=e%2?4:0;for(let a=-1;a<3;a++){let s=c+a*8+i,u=l+e*4;r.fillStyle=mc(o*4+a,n*4+e,t)>.5?G.cobble1:G.cobble3,r.fillRect(Math.max(c,s+1),u+1,Math.min(6,c+16-s-1),2),r.fillRect(Math.max(c,s+2),u,Math.min(4,c+16-s-2),1)}}break;case`water`:r.fillStyle=G.water1,r.fillRect(c,l,16,16);for(let e=0;e<3;e++){let t=c+Math.floor(u(e)*12),n=l+Math.floor(u(e+3)*14);r.fillStyle=G.water2,r.fillRect(t,n,4,1)}if(u(9)>.72){let e=c+3+Math.floor(u(10)*7),t=l+3+Math.floor(u(11)*7);r.fillStyle=G.leaf1,r.fillRect(e,t+1,6,3),r.fillRect(e+1,t,4,5),r.fillStyle=G.leaf2,r.fillRect(e+1,t+1,3,2),r.fillStyle=G.water1,r.fillRect(e+3,t,1,2),u(12)>.5&&(r.fillStyle=G.flowerPink,r.fillRect(e+1,t+1,2,2),r.fillStyle=G.white,r.fillRect(e+1,t+1,1,1))}break;case`soil`:case`field`:r.fillStyle=G.soil1,r.fillRect(c,l,16,16);for(let e=0;e<16;e+=4)r.fillStyle=G.soil2,r.fillRect(c,l+e+2,16,1),r.fillStyle=G.soil3,r.fillRect(c,l+e,16,1);for(let e=0;e<4;e++)a(c+Math.floor(u(e)*16),l+Math.floor(u(e+4)*16),G.soil3);break;case`dryfield`:{r.fillStyle=`#b89468`,r.fillRect(c,l,16,16);for(let e=0;e<16;e+=4)r.fillStyle=`#a4815a`,r.fillRect(c,l+e+2,16,1);r.fillStyle=`#8a6a48`;let e=c+2+Math.floor(u(1)*10),t=l+2+Math.floor(u(2)*10);r.fillRect(e,t,3,1),r.fillRect(e+2,t+1,1,2),r.fillRect(e+3,t+3,2,1);for(let e=0;e<4;e++)a(c+Math.floor(u(e+3)*16),l+Math.floor(u(e+8)*16),`#cdb088`);break}case`floor`:{r.fillStyle=G.wood3,r.fillRect(c,l,16,16),r.fillStyle=G.wood1;for(let e=0;e<16;e+=4)r.fillRect(c,l+e+3,16,1);let e=(n*5+o*3)%16;r.fillRect(c+e,l,1,4),r.fillRect(c+(e+8)%16,l+4,1,4),r.fillRect(c+(e+4)%16,l+8,1,4),r.fillRect(c+(e+12)%16,l+12,1,4);break}case`rug`:r.fillStyle=`#b8483e`,r.fillRect(c,l,16,16),r.fillStyle=`#e2c27a`,i(o-1,n)!==`rug`&&r.fillRect(c+1,l,1,16),i(o+1,n)!==`rug`&&r.fillRect(c+16-2,l,1,16),i(o,n-1)!==`rug`&&r.fillRect(c,l+1,16,1),i(o,n+1)!==`rug`&&r.fillRect(c,l+16-2,16,1),r.fillStyle=`#963a33`;for(let e=3;e<13;e+=4)r.fillRect(c+e,l+7,2,2);break;case`wall`:r.fillStyle=G.woodDark,r.fillRect(c,l,16,16)}}for(let n=0;n<e.h;n++)for(let o=0;o<e.w;o++){let s=e.ground[n][o],c=o*16,l=n*16,u=e=>e===`grass`||e===`flowers`;if(s===`path`||s===`cobble`||s===`soil`||s===`field`||s===`dryfield`){let e=[[0,-1,e=>[c+e,l]],[0,1,e=>[c+e,l+16-1]],[-1,0,e=>[c,l+e]],[1,0,e=>[c+16-1,l+e]]];for(let[r,s,c]of e)if(u(i(o+r,n+s))){for(let e=0;e<16;e++)if(mc(o*16+e,n*16+r*3+s*7,t+3)>.55){let[t,n]=c(e);a(t,n,G.grass2)}}}if(s===`water`){r.fillStyle=G.waterEdge,i(o,n-1)!==`water`&&r.fillRect(c,l,16,2),i(o-1,n)!==`water`&&r.fillRect(c,l,1,16),i(o+1,n)!==`water`&&r.fillRect(c+16-1,l,1,16),r.fillStyle=G.water3,i(o,n+1)!==`water`&&r.fillRect(c,l+16-2,16,2);for(let[e,t]of[[-1,-1],[1,-1],[-1,1],[1,1]])if(i(o+e,n)!==`water`&&i(o,n+t)!==`water`)for(let n=0;n<6;n++)for(let r=0;r<6;r++)Math.hypot(5.5-r,5.5-n)<=5.5||a(c+(e<0?r:15-r),l+(t<0?n:15-n),G.grass1)}}r.fillStyle=`rgba(40, 30, 40, 0.22)`;for(let t of e.buildings)r.fillRect(t.x*16,(t.y+t.d)*16,t.w*16,3);return n}function jc(e){return e>.9?G.grass3:G.grass1}var Y=new class{constructor(){K(this,`handlers`,new Map)}on(e,t){let n=this.handlers.get(e);return n||(n=new Set,this.handlers.set(e,n)),n.add(t),()=>n.delete(t)}emit(e,t){this.handlers.get(e)?.forEach(n=>{try{n(t)}catch(t){console.error(`[events] listener for ${String(e)} failed`,t)}})}},Mc=`modulepreload`,Nc=function(e,t){return new URL(e,t).href},Pc={},Fc=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=Nc(t,n),t=s(t),t in Pc)return;Pc[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:Mc,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},Ic=e=>({opening:`carver_ch${e}_opening`,waiting:`carver_ch${e}_waiting`,closing:`carver_ch${e}_closing`,after:`carver_ch${e}_after`}),Lc=[{id:`practice`,number:0,title:`Seeds for the Windowsill`,subtitle:`Practice quest`,status:`playable`,assignment:`Carver asked you to collect his seed packet from Mae Porter at the Seed & Mail and bring it to him.`,whyItMatters:`Carver wants you to practise looking closely. Noticing details is where every investigation begins.`,carver:{opening:`carver_practice_opening`,waiting:`carver_practice_waiting`,closing:`carver_practice_closing`,after:`carver_practice_after`},steps:[{id:`get_seeds`,kind:`talk`,npcId:`mae`,text:`Get the seed packet from Mae at the Seed & Mail`,lead:`Mae Porter is keeping a packet of seeds for Carver at the Seed & Mail, east of the town square.`,conversation:`mae_practice_give`,after:`mae_practice_after`,grants:[`seed_packet`]}],requiredItems:[`seed_packet`],itemUses:[{itemId:`seed_packet`,usedIn:`carver`,description:`Show Carver what you noticed, then give him the seeds to plant.`}],rewards:{xp:50,seeds:10,unlock:`Seed pot on your windowsill`},reflection:`You practised telling an observation (something anyone can check right now) from a guess or an opinion.`,objectives:[`observe`]},{id:`ch1`,number:1,title:`A Seed Is Planted`,subtitle:`Curiosity Collector`,status:`playable`,assignment:`Investigate what the community garden is telling us. Get tools from Hattie and Theo, look closely, and write down only what you can really see.`,whyItMatters:`Careful observations are the start of all science. Carver learned about plants by watching them closely as a boy.`,carver:{opening:`carver_ch1_opening`,waiting:`carver_ch1_waiting`,closing:`carver_ch1_closing`,after:`carver_ch1_after`},steps:[{id:`get_notebook`,kind:`talk`,npcId:`hattie`,text:`Get the field notebook from Hattie at the garden gate`,lead:`Hattie Bell, the gardener, keeps a field notebook for Carver. She is by the community garden gate.`,conversation:`hattie_ch1_give`,after:`hattie_ch1_after`,grants:[`field_notebook`]},{id:`get_lens`,kind:`talk`,npcId:`theo`,text:`Borrow the magnifying lens from Theo by the pond`,lead:`Theo, a young naturalist, always carries a magnifying lens. He is on the east side of the pond.`,conversation:`theo_ch1_give`,after:`theo_ch1_after`,grants:[`magnifying_lens`]},{id:`observe_sort`,kind:`minigame`,minigameId:`curiosity-collector`,text:`Inspect the garden spots, then sort your notes at the potting bench`,placeId:`garden`,uses:[`field_notebook`,`magnifying_lens`]}],requiredItems:[`field_notebook`,`magnifying_lens`],itemUses:[{itemId:`magnifying_lens`,usedIn:`minigame:curiosity-collector`,description:`Look closely at each garden spot to find small details.`},{itemId:`field_notebook`,usedIn:`minigame:curiosity-collector`,description:`Write down specific observations, then sort them from guesses.`}],rewards:{xp:150,seeds:20,unlock:`Nature Observation Card, and Chapter 2`},reflection:`You used a lens to find small details, wrote specific observations (with numbers, colors and sizes), and sorted them from guesses. That is how every investigation starts.`,objectives:[`observe`],analogActivity:{title:`Nature observation card`,description:`Go outside and record one thing you see, one you hear and one you touch. Write what is there, not what you think happened.`},loadRuntime:()=>Fc(()=>import(`./runtime-BzXQRX0E.js`),[],import.meta.url)},{id:`ch2`,number:2,title:`Science Against the Odds`,subtitle:`Choose the Path`,status:`playable`,assignment:`Put Carver's school years back in order using the schoolhouse displays, Ms. Nelson's records and Ada's clue. Then name one thing that stood in his way and one person who helped.`,whyItMatters:`Carver's journey shows how learning, and the people who helped him, made him a scientist, even when unfair rules closed doors.`,carver:{opening:`carver_ch2_opening`,waiting:`carver_ch2_waiting`,closing:`carver_ch2_closing`,after:`carver_ch2_after`},steps:[{id:`get_record`,kind:`talk`,npcId:`ruth`,text:`Get the school records from Ms. Nelson by the schoolhouse`,lead:`Ms. Ruth Nelson, the teacher, has a folder of records about Carver's schooling. She is outside the schoolhouse.`,conversation:`ruth_ch2_give`,after:`ruth_ch2_after`,grants:[`school_record`]},{id:`get_sketch`,kind:`talk`,npcId:`ada`,text:`Visit Ada, the young artist in the town square`,lead:`Ada, a young artist, is sketching in the town square. She knows about Carver and art.`,conversation:`ada_ch2_give`,after:`ada_ch2_after`,grants:[`botanical_sketch`]},{id:`build_timeline`,kind:`minigame`,minigameId:`journey-timeline`,text:`Visit the displays in the schoolhouse, then build the timeline on the chalkboard`,placeId:`school`,uses:[`school_record`,`botanical_sketch`]}],requiredItems:[`school_record`,`botanical_sketch`],itemUses:[{itemId:`school_record`,usedIn:`minigame:journey-timeline`,description:`Dates for the timeline cards.`},{itemId:`botanical_sketch`,usedIn:`minigame:journey-timeline`,description:`A clue: Carver studied art before plants.`}],rewards:{xp:150,seeds:20,unlock:`Journey Card, and Chapter 3`},objectives:[`journey`],analogActivity:{title:`Journey timeline and reflection`,description:`Draw a timeline of something you learned and who helped you.`},reflection:`You put the stages of Carver's education in order, named racism as an unfair barrier, and named people who supported him. Learning gave him tools to help others.`,loadRuntime:()=>Fc(()=>import(`./runtime-BsIP09oW.js`),[],import.meta.url)},{id:`ch3`,number:3,title:`The Soil Speaks`,subtitle:`Virtual Soil Lab`,status:`playable`,assignment:`Find out why Mr. Hill's west plot is worn out. Compare his two plots up close, test planting plans for four seasons, and bring Carver a plan that still grows cotton and helps the soil.`,whyItMatters:`Healthy soil feeds families year after year. Carver taught farmers to take turns with crops so tired fields could recover.`,carver:{opening:`carver_ch3_opening`,waiting:`carver_ch3_waiting`,closing:`carver_ch3_closing`,after:`carver_ch3_after`},steps:[{id:`get_samples`,kind:`talk`,npcId:`amos`,text:`Get soil samples and the crop history from Mr. Hill by the farm gate`,lead:`Mr. Amos Hill, the farmer, has soil samples and a record of what he planted. He is by the Hilltop Farm gate, north of the road.`,conversation:`amos_ch3_give`,after:`amos_ch3_after`,grants:[`soil_samples`,`crop_history`]},{id:`get_cards`,kind:`talk`,npcId:`mae`,text:`Get crop cards from Mae at the Seed & Mail`,lead:`Mae Porter keeps crop cards for the crops that grow around here. She is at the Seed & Mail stall.`,conversation:`mae_ch3_give`,after:`mae_ch3_after`,grants:[`crop_cards`]},{id:`soil_lab`,kind:`minigame`,minigameId:`soil-lab`,text:`Look at both plots up close, then test plans at the bench in Hilltop Farm`,placeId:`farm`,uses:[`soil_samples`,`crop_history`,`crop_cards`]}],requiredItems:[`soil_samples`,`crop_history`,`crop_cards`],itemUses:[{itemId:`soil_samples`,usedIn:`minigame:soil-lab`,description:`Magnified views of each plot's soil.`},{itemId:`crop_history`,usedIn:`minigame:soil-lab`,description:`What each plot grew before.`},{itemId:`crop_cards`,usedIn:`minigame:soil-lab`,description:`The crops to plan with, legumes marked.`}],rewards:{xp:150,seeds:20,unlock:`Crop-Rotation Planner, and Chapter 4`},objectives:[`soil`],analogActivity:{title:`Crop-rotation planner`,description:`Plan four seasons of planting on paper or with cups of soil.`},reflection:`You compared tired soil with healthy soil, tested planting plans, and found that cotton every year wears soil out, while taking turns with legumes slowly helps it recover.`,loadRuntime:()=>Fc(()=>import(`./runtime-DXPw9jJf.js`),[],import.meta.url)},{id:`ch4`,number:4,title:`The Peanut Isn't Just a Peanut`,subtitle:`Inventor's Workshop`,status:`coming-soon`,assignment:`Find a useful new purpose for a crop.`,whyItMatters:`Testing ideas against a real need turns a crop into a solution.`,carver:Ic(4),steps:[],requiredItems:[`need_card`,`materials_kit`],itemUses:[],rewards:{xp:150,seeds:25},objectives:[`invent`],analogActivity:{title:`Invention sketch`,description:`Sketch an invention using things you can find at home.`}},{id:`ch5`,number:5,title:`Science for the People`,subtitle:`Farm Helper`,status:`coming-soon`,assignment:`Help neighbors with different growing problems.`,whyItMatters:`Science matters most when it helps real people.`,carver:Ic(5),steps:[],requiredItems:[`farm_report_a`,`farm_report_b`,`resource_map`],itemUses:[],rewards:{xp:150,seeds:25},objectives:[`help`],analogActivity:{title:`Growing-need interview`,description:`Ask someone about a problem with growing food or plants.`}},{id:`ch6`,number:6,title:`A Scientist's Method`,subtitle:`Design Your Own Experiment`,status:`coming-soon`,assignment:`Design a fair test for an unanswered question.`,whyItMatters:`Changing one thing at a time lets data tell the truth.`,carver:Ic(6),steps:[],requiredItems:[`measuring_tool`,`trial_seeds`],itemUses:[],rewards:{xp:200,seeds:30},objectives:[`method`],analogActivity:{title:`One-variable plant experiment`,description:`Plan a safe seed test that changes just one thing.`}},{id:`ch7`,number:7,title:`Your Turn to Plant the Seeds`,subtitle:`My Carver Project`,status:`coming-soon`,assignment:`Use what you learned to help your own community.`,whyItMatters:`Now you are the scientist and inventor.`,carver:Ic(7),steps:[],requiredItems:[`need_cards`,`prototype_kit`],itemUses:[],rewards:{xp:250,seeds:40},objectives:[`capstone`],analogActivity:{title:`Invention poster and test log`,description:`Make a poster of your invention and how you would test it.`}}];function X(e,t,n){let r={};return n.forEach(e=>r[e.id]=e),{id:e,title:t,start:n[0].id,nodes:r}}var Rc=`practice`,zc=Object.fromEntries([X(`carver_practice_opening`,`Carver: A small first task`,[{id:`a1`,speaker:`carver`,expression:`smile`,text:`Well, hello there! Welcome to Sweetgum Hollow. I'm George Washington Carver.`,next:`a2`},{id:`a2`,speaker:`carver`,expression:`neutral`,text:`I'm a scientist. I spent my life studying plants and soil, and teaching at Tuskegee Institute in Alabama.`,next:`a3`},{id:`a3`,speaker:`carver`,expression:`curious`,text:`When I was a boy, neighbors called me the 'plant doctor', because I helped sick plants grow strong again.`,next:`a4`},{id:`a4`,speaker:`carver`,expression:`smile`,text:`Every good investigation starts with a small task. Will you help me with one?`,choices:[{text:`Yes, I'd love to help!`,next:`a6`},{text:`What kind of help?`,next:`a5`}]},{id:`a5`,speaker:`carver`,expression:`thinking`,text:`I ordered a packet of seeds for my windowsill, but I haven't picked it up yet. Mae Porter is keeping it at the Seed & Mail, east of the town square.`,choices:[{text:`I'll go and get it!`,next:`a6`}]},{id:`a6`,speaker:`carver`,expression:`smile`,effects:[{type:`acceptQuest`,chapterId:Rc}],text:`Wonderful! Mae's shop has a green roof and a striped stall out front. Your journal will remember where to go.`,next:`a7`},{id:`a7`,speaker:`carver`,expression:`curious`,text:`And while you carry the packet, take a good look at it. A scientist notices things.`,next:null}]),X(`carver_practice_waiting`,`Carver: Where to find Mae`,[{id:`w1`,speaker:`carver`,expression:`smile`,text:`Mae Porter is at the Seed & Mail, east of the town square. Look for the green roof and the striped stall.`,choices:[{text:`I'm on my way.`,next:null},{text:`Why do you need the seeds?`,next:`w2`}]},{id:`w2`,speaker:`carver`,expression:`curious`,text:`I don't even know what kind they are yet! That's half the fun. We'll look closely and find out.`,next:null}]),X(`mae_practice_give`,`Mae: The seed packet`,[{id:`m1`,speaker:`mae`,expression:`smile`,text:`Well now, a new face! You must be the explorer Professor Carver told me about.`,next:`m2`},{id:`m2`,speaker:`mae`,expression:`neutral`,text:`He sent for a packet of seeds weeks ago. It came up from a farm down south, but the label never says what kind they are.`,choices:[{text:`Can I take them to him?`,next:`m4`},{text:`What is the Seed & Mail?`,next:`m3`}]},{id:`m3`,speaker:`mae`,expression:`smile`,text:`Seeds, letters and parcels! Farmers swap seeds here, and folks send letters to family far away. Everything that grows or goes passes through my stall.`,choices:[{text:`Can I take the seeds to Carver?`,next:`m4`}]},{id:`m4`,speaker:`mae`,expression:`smile`,effects:[{type:`grantItem`,itemId:`seed_packet`,from:`mae`},{type:`completeStep`,chapterId:Rc,stepId:`get_seeds`}],text:`Of course. Here you are: one packet of mystery seeds. Handle it gently!`,next:`m5`},{id:`m5`,speaker:`mae`,expression:`neutral`,text:`Have a good look inside before you hand it over. Open your bag (press I, or tap Bag) and choose the packet.`,next:null}]),X(`mae_practice_after`,`Mae: After the delivery`,[{id:`x1`,speaker:`mae`,expression:`smile`,text:`Did the Professor like his seeds? Whatever they are, he'll find out. He always does.`,next:null}]),X(`carver_practice_closing`,`Carver: What did you notice?`,[{id:`c1`,speaker:`carver`,expression:`smile`,text:`You found Mae, and you brought the packet! Thank you, friend.`,next:`c2`},{id:`c2`,speaker:`carver`,expression:`curious`,text:`Before we plant them, tell me what you noticed. Scientists start with observations.`,next:`q`},{id:`q`,kind:`question`,speaker:`carver`,expression:`curious`,objectiveId:`observe`,text:`Which of these is an observation: something you can see about the seeds right now?`,options:[{id:`future`,text:`They will grow into giant sunflowers.`,correct:!1,misconception:`prediction-as-observation`,feedback:`That's a guess about the future. It might even turn out right! But we can't see it yet.`},{id:`obs`,text:`They are small, flat and tan, with a pointed tip.`,correct:!0,feedback:`Yes! That's an observation. You used your eyes, and anyone looking at the seeds could check it.`},{id:`opinion`,text:`They are the best seeds in town.`,correct:!1,misconception:`opinion-as-observation`,feedback:`That's an opinion. Mae might disagree! An observation is something anyone can check.`}],hints:[`Here is a clue: an observation is something you can see, hear, touch or measure right now.`,`Two of those answers are about the future or about what someone thinks. Which one only describes how the seeds look?`,`Let's check together: 'small, flat and tan'. Can we see that right now? Yes! So that is the observation.`],next:`c3`},{id:`c3`,speaker:`carver`,expression:`proud`,effects:[{type:`useItem`,itemId:`seed_packet`,usedIn:`Given to Carver to plant`}],text:`Observations are the seeds of science: small, true things we can build on.`,textIfRetried:`You checked your thinking and tried again. Scientists do that all the time! Observations are the seeds of science: small, true things we can build on.`,next:`c4`},{id:`c4`,speaker:`carver`,expression:`smile`,text:`Let's plant a few in a little pot for your windowsill. Whatever they turn out to be, we'll find out by watching.`,next:`c5`},{id:`c5`,speaker:`carver`,expression:`neutral`,effects:[{type:`completeChapter`,chapterId:Rc}],text:`Rest when you need to, and explore the town. Soon I'll need your help with a real puzzle in the garden.`,next:null}]),X(`carver_practice_after`,`Carver: Patient watchers`,[{id:`r1`,speaker:`carver`,expression:`smile`,text:`Your seed pot is on the windowsill in your cottage. Check on it now and then. Scientists are patient watchers.`,choices:[{text:`What will we do next?`,next:`r2`},{text:`See you soon!`,next:null}]},{id:`r2`,speaker:`carver`,expression:`curious`,text:`The community garden has been acting strangely. When you're ready, we'll investigate what it's telling us.`,next:null}]),X(`carver_ambient`,`Carver: Hello again`,[{id:`z1`,speaker:`carver`,expression:`smile`,text:`Hello again, friend. What have you noticed today?`,next:null}]),X(`carver_ch1_opening`,`Carver: What is the garden telling us?`,[{id:`o1`,speaker:`carver`,expression:`curious`,text:`Friend, I'm glad you're here. Something is going on in the community garden.`,next:`o2`},{id:`o2`,speaker:`carver`,expression:`thinking`,text:`Some bean leaves have holes. The soil by the fence stays dark. A small creature or two may be involved. What is the garden telling us?`,next:`o3`},{id:`o3`,speaker:`carver`,expression:`smile`,text:`When I was a boy, I spent every hour I could in the woods, just looking. Would you like to see a memory from those days?`,choices:[{text:`Yes, show me the memory.`,next:`o4`,effects:[{type:`showMemory`,memoryId:`childhood`}]},{text:`Maybe later.`,next:`o4`}]},{id:`o4`,speaker:`carver`,expression:`neutral`,text:`To investigate, we need two things: a way to look closely, and a way to remember what we see.`,next:`o5`},{id:`o5`,speaker:`carver`,expression:`smile`,effects:[{type:`acceptQuest`,chapterId:`ch1`}],text:`Hattie Bell, our gardener, keeps a field notebook for me. Young Theo, over by the pond, always carries a magnifying lens. Ask them both, then look closely at the garden.`,next:`o6`},{id:`o6`,speaker:`carver`,expression:`curious`,text:`Write down only what you can really see. We'll sort out the guessing afterward.`,next:null}]),X(`carver_ch1_waiting`,`Carver: How is the investigation going?`,[{id:`w1`,speaker:`carver`,expression:`curious`,text:`{carverNudge}`,choices:[{text:`I'm on it!`,next:null},{text:`Can I see your memory again?`,next:`w2`,effects:[{type:`showMemory`,memoryId:`childhood`}]}]},{id:`w2`,speaker:`carver`,expression:`smile`,text:`Those woods taught me to be patient. Plants tell their story slowly.`,next:null}]),X(`carver_ch1_closing`,`Carver: Reading your notebook`,[{id:`c1`,speaker:`carver`,expression:`smile`,text:`Welcome back, investigator! May I see your notebook?`,next:`c2`},{id:`c2`,speaker:`carver`,expression:`curious`,text:`You wrote: "{obsFirst}" That is a real observation. Anyone could kneel down and check it.`,next:`c3`},{id:`c3`,speaker:`carver`,expression:`thinking`,text:`{sortReflection}`,next:`q`},{id:`q`,kind:`question`,speaker:`carver`,expression:`curious`,objectiveId:`observe`,text:`One more question. Why is "The soil by the fence is dark and damp" an observation, while "A rabbit must have chewed the bean leaves" is a guess?`,options:[{id:`rabbits`,text:`Because rabbits don't like beans.`,correct:!1,misconception:`new-guess-as-evidence`,feedback:`Hmm, that's a new guess about rabbits! The question is about what we can check right now.`},{id:`evidence`,text:`We can see and touch the soil, but nobody saw a rabbit.`,correct:!0,feedback:`Exactly. The soil is right in front of us. The rabbit is an idea about what might have happened.`},{id:`length`,text:`Because the soil sentence is shorter.`,correct:!1,misconception:`surface-feature`,feedback:`Length isn't the clue. Think about which one we can check with our own eyes.`}],hints:[`Here is a clue: think about what is really in the garden right now that you can look at.`,`Did anyone actually see a rabbit? Pick the answer about what we can and cannot see.`,`Worked example: the soil is there to touch, but nobody saw a rabbit. So "We can see and touch the soil, but nobody saw a rabbit" is the answer.`],next:`c4`},{id:`c4`,speaker:`carver`,expression:`proud`,text:`When I was young, I learned about plants by watching them, day after day. Today you did the same thing.`,textIfRetried:`You checked your thinking and changed your answer. Good scientists do that. When I was young, I learned about plants by watching them, day after day. Today you did the same thing.`,next:`c5`},{id:`c5`,speaker:`carver`,expression:`smile`,effects:[{type:`grantItem`,itemId:`nature_card`,from:`carver`}],text:`This is for you: a Nature Observation Card. Take it outside in your own neighborhood and find three things you can see, hear or touch.`,next:`c6`},{id:`c6`,speaker:`carver`,expression:`thinking`,text:`Guesses aren't bad, you know. A good guess is where the next experiment begins. But first, we observe.`,next:`c7`},{id:`c7`,speaker:`carver`,expression:`neutral`,effects:[{type:`completeChapter`,chapterId:`ch1`}],text:`Next time, I will tell you how I kept on learning, even when the nearby school would not let me in.`,next:null}]),X(`carver_ch1_after`,`Carver: After the garden`,[{id:`a1`,speaker:`carver`,expression:`smile`,text:`Your Nature Observation Card is in your bag. The garden is always open if you want to look again.`,choices:[{text:`Can I see your memory again?`,next:`a2`,effects:[{type:`showMemory`,memoryId:`childhood`}]},{text:`How do I look at the garden again?`,next:`a3`},{text:`See you soon!`,next:null}]},{id:`a2`,speaker:`carver`,expression:`smile`,text:`Some of my best teachers were trees.`,next:null},{id:`a3`,speaker:`carver`,expression:`neutral`,text:`Walk up to any spot in the garden and look with Theo's lens. The potting bench by the gate has the card game, if you'd like to sort again.`,next:null}]),X(`hattie_ch1_give`,`Hattie: The field notebook`,[{id:`h1`,speaker:`hattie`,expression:`smile`,text:`Afternoon! You must be Carver's new helper. I'm Hattie Bell. I look after this garden.`,next:`h2`},{id:`h2`,speaker:`hattie`,expression:`thinking`,text:`Something's been nibbling my beans, and the soil by the east fence never dries out. I keep meaning to write it all down.`,choices:[{text:`What should I look for?`,next:`h3`},{text:`Could I borrow the field notebook?`,next:`h4`}]},{id:`h3`,speaker:`hattie`,expression:`neutral`,text:`Look at the undersides of the leaves, and kneel down by the soil. The small things tell the big story.`,next:`h4`},{id:`h4`,speaker:`hattie`,expression:`smile`,effects:[{type:`grantItem`,itemId:`field_notebook`,from:`hattie`},{type:`completeStep`,chapterId:`ch1`,stepId:`get_notebook`}],text:`Here is the field notebook. The first page shows how to write an observation: what you see, how many, what color, what size.`,next:`h5`},{id:`h5`,speaker:`hattie`,expression:`neutral`,text:`Sparkles will mark the spots I'm puzzling over, once you have Theo's lens too. There's a sorting game on my potting bench for afterward.`,next:null}]),X(`hattie_ch1_after`,`Hattie: Count it, measure it`,[{id:`ha`,speaker:`hattie`,expression:`smile`,text:`How is the notebook? Remember: count it, measure it, and describe its color.`,next:null}]),X(`hattie_ambient`,`Hattie: Garden rows`,[{id:`hb`,speaker:`hattie`,expression:`smile`,text:`Beans on the left, lettuce and carrots in between. A garden is a lot of little neighbors sharing one bed.`,next:null}]),X(`theo_ch1_give`,`Theo: The magnifying lens`,[{id:`t1`,speaker:`theo`,expression:`curious`,text:`Shh! There is a ladybug on my sleeve. Look! What do you notice about it?`,next:`tq`},{id:`tq`,kind:`question`,speaker:`theo`,expression:`curious`,objectiveId:`observe`,text:`Which one is something you can notice, not a guess?`,options:[{id:`family`,text:`It is looking for its family.`,correct:!1,misconception:`story-as-observation`,feedback:`Maybe! But we can't see what it's thinking. That part is a guess.`},{id:`fastest`,text:`It is the fastest bug in town.`,correct:!1,misconception:`opinion-as-observation`,feedback:`We'd need a race to know that! Right now it's a guess.`},{id:`spots`,text:`It is red with seven black spots.`,correct:!0,feedback:`Yes! I counted seven too. Spots are something you can check.`}],hints:[`Here is a clue: look at its color, and count its spots.`,`One answer describes the ladybug's body. The others are about feelings or races.`,`Worked example: "red with seven black spots" is something your eyes can check, so that one is the observation.`],next:`t2`},{id:`t2`,speaker:`theo`,expression:`smile`,effects:[{type:`grantItem`,itemId:`magnifying_lens`,from:`theo`},{type:`completeStep`,chapterId:`ch1`,stepId:`get_lens`}],text:`You'd make a good naturalist. Here, borrow my magnifying lens. It makes tiny things look big!`,next:`t3`},{id:`t3`,speaker:`theo`,expression:`neutral`,text:`Hold it close and look for the small details: edges, tiny hairs, specks of pollen.`,next:null}]),X(`theo_ch1_after`,`Theo: Tiny things`,[{id:`tb`,speaker:`theo`,expression:`smile`,text:`Found anything tiny yet? Once I saw a beetle whose wings shimmered green and purple!`,next:null}]),X(`theo_ambient`,`Theo: Pond skaters`,[{id:`tc`,speaker:`theo`,expression:`curious`,text:`I'm watching the pond skaters. They stand right on top of the water!`,next:null}]),X(`carver_ch2_opening`,`Carver: The road to school`,[{id:`o1`,speaker:`carver`,expression:`neutral`,text:`Last time I told you I kept on learning, even when a school would not let me in. Today I would like you to see that journey for yourself.`,next:`o2`},{id:`o2`,speaker:`carver`,expression:`thinking`,text:`Ms. Nelson has opened the schoolhouse. Inside are storybook displays about my school years, but they are all out of order.`,next:`o3`},{id:`o3`,speaker:`carver`,expression:`neutral`,sensitive:{skipTo:`o5`},text:`Some parts are hard. When I was a boy, the school in Diamond, Missouri, did not allow Black children. That rule was unfair. It was racism, and it was not my fault.`,choices:[{text:`That's not fair!`,next:`o4a`},{text:`What did you do?`,next:`o4b`}]},{id:`o4a`,speaker:`carver`,expression:`thinking`,text:`You're right, it was not fair. I felt sad about it, and I still wanted to learn. So I kept looking for a way.`,next:`o5`},{id:`o4b`,speaker:`carver`,expression:`smile`,text:`I kept looking for a school that would teach me, even when it meant leaving home. And people helped me along the way.`,next:`o5`},{id:`o5`,speaker:`carver`,expression:`smile`,effects:[{type:`acceptQuest`,chapterId:`ch2`}],text:`Ms. Nelson, the teacher, has school records with dates in them. And Ada, the young artist in the town square, has something to show you about art.`,next:`o6`},{id:`o6`,speaker:`carver`,expression:`curious`,text:`Put my journey in order. Then tell me: what stood in my way, and who helped me?`,next:null}]),X(`carver_ch2_waiting`,`Carver: How is the timeline coming?`,[{id:`w1`,speaker:`carver`,expression:`curious`,text:`{carverNudge2}`,choices:[{text:`I'm on it!`,next:null},{text:`Why was the school rule unfair?`,next:`w2`}]},{id:`w2`,speaker:`carver`,expression:`neutral`,sensitive:{skipTo:null},text:`Because it judged children by the color of their skin, instead of letting every child learn. Rules like that were wrong, even when they were the law.`,next:null}]),X(`carver_ch2_closing`,`Carver: Looking back at the road`,[{id:`c1`,speaker:`carver`,expression:`smile`,text:`You put my journey in order. Seeing it all laid out like that... it was a long road.`,next:`c2`},{id:`c2`,speaker:`carver`,expression:`thinking`,sensitive:{skipTo:`c3`},text:`You named a barrier: {barrierText} Doors were closed to me because I was Black. That was wrong, and it is good that you can see it clearly.`,next:`c3`},{id:`c3`,speaker:`carver`,expression:`proud`,text:`And you named someone who helped: {supportText} {supportThanks}`,next:`q`},{id:`q`,kind:`question`,speaker:`carver`,expression:`curious`,objectiveId:`journey`,text:`Here is my question for you. Why do you think learning mattered so much for my science?`,options:[{id:`rest`,text:`So you would never have to work hard again.`,correct:!1,misconception:`learning-as-escape-from-work`,feedback:`Ha! I worked hard my whole life. Learning did not replace work. It made my work more useful.`},{id:`tools`,text:`Learning gave you tools to help farmers and to share what you found.`,correct:!0,feedback:`Yes. Reading, art and botany all became tools I could use to help people grow better crops.`},{id:`easy`,text:`Because school was easy for you.`,correct:!1,misconception:`school-was-easy`,feedback:`It was not easy at all! Think about what learning let me do for other people.`}],hints:[`Here is a clue: think about who Carver helped with his science.`,`Carver worked hard his whole life, and school was not easy. Which answer is about helping people?`,`Worked example: learning gave Carver skills he could use to help farmers. So "Learning gave you tools to help farmers and to share what you found" is the answer.`],next:`c4`},{id:`c4`,speaker:`carver`,expression:`smile`,text:`Everything I learned became something I could give back. That is what my helpers hoped for, too.`,textIfRetried:`You thought it through and changed your answer. Good. Everything I learned became something I could give back. That is what my helpers hoped for, too.`,next:`c5`},{id:`c5`,speaker:`carver`,expression:`smile`,effects:[{type:`grantItem`,itemId:`journey_card`,from:`carver`}],text:`This is for you: a Journey Card. Draw a timeline of something you have learned, and write down one person who helped you.`,next:`c6`},{id:`c6`,speaker:`carver`,expression:`neutral`,effects:[{type:`completeChapter`,chapterId:`ch2`}],text:`Next time, we will put that learning to work. Some of the farmland around here is tired, and the soil needs a scientist.`,next:null}]),X(`carver_ch2_after`,`Carver: Helpers along the way`,[{id:`a1`,speaker:`carver`,expression:`smile`,text:`Your Journey Card is in your bag. The schoolhouse displays are always open if you want to visit them again.`,choices:[{text:`Who helped you the most?`,next:`a2`},{text:`See you soon!`,next:null}]},{id:`a2`,speaker:`carver`,expression:`thinking`,text:`So many people. A family who taught me to read, a nurse who gave me a home, an art teacher who saw what I could do. No one travels that road alone.`,next:null}]),X(`ruth_ch2_give`,`Ms. Nelson: The school records`,[{id:`r1`,speaker:`ruth`,expression:`smile`,text:`Welcome! I'm Ms. Nelson, the teacher here. Carver says you are putting his school years back in order.`,next:`r2`},{id:`r2`,speaker:`ruth`,expression:`neutral`,text:`History detectives use records. I have a folder of copies about Carver's schooling, sent to us by a museum.`,choices:[{text:`What is a record?`,next:`r3`},{text:`Can I see the folder?`,next:`r4`}]},{id:`r3`,speaker:`ruth`,expression:`thinking`,text:`A record is something written down at the time, like a diploma or a letter. It helps us know when things happened, instead of guessing.`,next:`r4`},{id:`r4`,speaker:`ruth`,expression:`smile`,effects:[{type:`grantItem`,itemId:`school_record`,from:`ruth`},{type:`completeStep`,chapterId:`ch2`,stepId:`get_record`}],text:`Here is the folder. Some records have dates. Two moments have no dates at all, so the displays will have to help you.`,next:`r5`},{id:`r5`,speaker:`ruth`,expression:`neutral`,text:`The schoolhouse door is open now. Visit every display, then build the timeline on my chalkboard.`,next:null}]),X(`ruth_ch2_after`,`Ms. Nelson: Each display`,[{id:`ra`,speaker:`ruth`,expression:`smile`,text:`Take your time inside. Every display is a real moment from Carver's life.`,next:null}]),X(`ruth_ambient`,`Ms. Nelson: A seat for everyone`,[{id:`rb`,speaker:`ruth`,expression:`smile`,text:`Every child deserves a seat in a classroom. That is why I teach.`,next:null}]),X(`ada_ch2_give`,`Ada: The botanical sketch`,[{id:`d1`,speaker:`ada`,expression:`curious`,text:`Oh, hi! Sorry, I was drawing this leaf. Did you know Carver was a painter before he was a scientist?`,choices:[{text:`Really? Tell me more.`,next:`d2`},{text:`Why are you drawing a leaf?`,next:`d2b`}]},{id:`d2`,speaker:`ada`,expression:`smile`,text:`At Simpson College in Iowa, he studied art. His teacher, Etta Budd, saw how well he painted plants and encouraged him to study botany, the science of plants.`,next:`d3`},{id:`d2b`,speaker:`ada`,expression:`neutral`,text:`To draw something, you have to look really closely. Carver painted plants, too! His art teacher, Etta Budd, noticed and encouraged him to study plants in college.`,next:`d3`},{id:`d3`,speaker:`ada`,expression:`thinking`,text:`My art teacher encouraged me when I almost gave up. Sometimes one person believing in you changes everything.`,next:`d4`},{id:`d4`,speaker:`ada`,expression:`smile`,effects:[{type:`grantItem`,itemId:`botanical_sketch`,from:`ada`},{type:`completeStep`,chapterId:`ch2`,stepId:`get_sketch`}],text:`Here, take my leaf sketch. It is a clue for your timeline: Carver studied art first, and plants after.`,next:`d5`},{id:`d5`,speaker:`ada`,expression:`smile`,text:`Good luck! Tell Carver I said hi.`,next:null}]),X(`ada_ch2_after`,`Ada: Tricky shapes`,[{id:`da`,speaker:`ada`,expression:`smile`,text:`I am drawing the pond reeds next. Their shapes are trickier than they look!`,next:null}]),X(`ada_ambient`,`Ada: Sketching`,[{id:`db`,speaker:`ada`,expression:`curious`,text:`I sketch something new every day. Today it is the well. Look at all those stones!`,next:null}]),X(`carver_ch3_opening`,`Carver: The tired field`,[{id:`o1`,speaker:`carver`,expression:`smile`,text:`Have you met Mr. Hill? He farms Hilltop Farm, just north of the road. His cotton in the west plot gets smaller every year, and he does not know why.`,next:`o2`},{id:`o2`,speaker:`carver`,expression:`thinking`,text:`When a crop keeps doing poorly, a scientist asks the soil. Soil is alive, and it tells you a lot if you look closely.`,choices:[{text:`How can soil be alive?`,next:`o3`},{text:`What should I do?`,next:`o4`}]},{id:`o3`,speaker:`carver`,expression:`curious`,text:`A spoonful of healthy soil holds roots, worms, bits of old leaves and tiny living things too small to see. Together they feed the plants.`,next:`o4`},{id:`o4`,speaker:`carver`,expression:`smile`,effects:[{type:`acceptQuest`,chapterId:`ch3`}],text:`Mr. Hill has soil samples and a record of what he planted. Mae at the Seed & Mail keeps crop cards for the crops that grow around here.`,next:`o5`},{id:`o5`,speaker:`carver`,expression:`curious`,text:`Compare his two plots, test some planting plans for the next four seasons, and bring me the plan you think is best. Then tell me why it works.`,next:null}]),X(`carver_ch3_waiting`,`Carver: How is the soil lab going?`,[{id:`w1`,speaker:`carver`,expression:`curious`,text:`{carverNudge3}`,choices:[{text:`I'm on it!`,next:null},{text:`What is nitrogen?`,next:`w2`}]},{id:`w2`,speaker:`carver`,expression:`thinking`,text:`Nitrogen is a plant food. Plants need it to grow leaves and stems. Soil can run low on it, like a pantry running out of flour.`,next:null}]),X(`carver_ch3_closing`,`Carver: Your plan for the west plot`,[{id:`c1`,speaker:`carver`,expression:`smile`,text:`Let me see your plan: {planText}.`,next:`c2`},{id:`c2`,speaker:`carver`,expression:`thinking`,text:`{planCompare}`,next:`c3`},{id:`c3`,speaker:`carver`,expression:`proud`,text:`{cottonCompare}`,next:`q`},{id:`q`,kind:`question`,speaker:`carver`,expression:`curious`,objectiveId:`soil`,text:`Here is my question for you. What did the legumes in your plan do for the soil?`,options:[{id:`fixall`,text:`They fixed all of the soil in one season.`,correct:!1,misconception:`instant-restoration`,feedback:`Not so fast! Soil gets better slowly. Look at your soil bar: each legume season added only a little.`},{id:`slow`,text:`They put back a little nitrogen each season, so the soil slowly got healthier.`,correct:!0,feedback:`Yes. Legumes add a little at a time. Taking turns, season after season, is what helps tired soil.`},{id:`pests`,text:`They scared the pests away forever.`,correct:!1,misconception:`legumes-stop-pests`,feedback:`Changing crops can slow pests down, but nothing stops them forever. Think about what legume roots do.`}],hints:[`Here is a clue: think about the bumps on the legume roots in the east plot.`,`Those bumps help put nitrogen into the soil. Did the soil bar jump all at once, or rise a little each season?`,`Worked example: each legume season added a few soil points, not all at once. So "They put back a little nitrogen each season" is the answer.`],next:`c4`},{id:`c4`,speaker:`carver`,expression:`smile`,text:`Right. And rain and weather still matter. A good plan makes good harvests more likely. It cannot promise them.`,textIfRetried:`You changed your answer after thinking it through. That is good science. Rain and weather still matter, too: a good plan makes good harvests more likely, but it cannot promise them.`,next:`c5`},{id:`c5`,speaker:`carver`,expression:`thinking`,text:`I worked on this very problem at Tuskegee, with farmers whose fields had grown cotton for years. Would you like to see a memory?`,choices:[{text:`Yes, show me the memory.`,next:`c6`,effects:[{type:`showMemory`,memoryId:`tuskegee_soil`}]},{text:`Maybe later.`,next:`c6`}]},{id:`c6`,speaker:`carver`,expression:`smile`,effects:[{type:`grantItem`,itemId:`rotation_card`,from:`carver`}],text:`This is for you: a Crop-Rotation Planner. Plan four seasons on paper, or try it with cups of soil and bean seeds, with a grown-up.`,next:`c7`},{id:`c7`,speaker:`carver`,expression:`curious`,effects:[{type:`completeChapter`,chapterId:`ch3`}],text:`Next time: peanuts. If farmers grow lots of them, they will need new ways to use them. That is a job for an inventor.`,next:null}]),X(`carver_ch3_after`,`Carver: Patient soil`,[{id:`a1`,speaker:`carver`,expression:`smile`,text:`Mr. Hill is trying your plan in the west plot. Soil takes time, so we will keep watching. Your planner is in your bag.`,choices:[{text:`Can I see the Tuskegee memory?`,next:`a2`,effects:[{type:`showMemory`,memoryId:`tuskegee_soil`}]},{text:`See you soon!`,next:null}]},{id:`a2`,speaker:`carver`,expression:`smile`,text:`Every field is an experiment, if you keep good notes.`,next:null}]),X(`amos_ch3_give`,`Mr. Hill: The west plot`,[{id:`m1`,speaker:`amos`,expression:`smile`,text:`Howdy! Amos Hill. Carver sent you about my west plot? Glad to have the help.`,next:`m2`},{id:`m2`,speaker:`amos`,expression:`thinking`,text:`I have planted cotton there five years running. Cotton sells, and my family needs the money. But every year the plants come up thinner.`,choices:[{text:`Why not plant something else?`,next:`m3a`},{text:`What about your east plot?`,next:`m3b`}]},{id:`m3a`,speaker:`amos`,expression:`neutral`,text:`I still need some cotton. It pays for seed and shoes. But I would take turns with other crops, if the plan still grows cotton sometimes.`,next:`m4`},{id:`m3b`,speaker:`amos`,expression:`curious`,text:`The east plot took turns: cotton, peanuts, cotton, cowpeas, cotton. My neighbor talked me into it. That cotton looks much better. Funny, right?`,next:`m4`},{id:`m4`,speaker:`amos`,expression:`smile`,effects:[{type:`grantItem`,itemId:`soil_samples`,from:`amos`},{type:`grantItem`,itemId:`crop_history`,from:`amos`},{type:`completeStep`,chapterId:`ch3`,stepId:`get_samples`}],text:`Here are two jars of soil, one from each plot, and my ledger of what I planted. Look at them up close out in the fields.`,next:`m5`},{id:`m5`,speaker:`amos`,expression:`neutral`,text:`The gate is open now. Just remember: any plan for the west plot has to grow some cotton.`,next:null}]),X(`amos_ch3_after`,`Mr. Hill: Soil does not hurry`,[{id:`ma`,speaker:`amos`,expression:`smile`,text:`Take your time in the fields. Soil does not hurry, and neither do I.`,next:null}]),X(`amos_ambient`,`Mr. Hill: The scarecrow`,[{id:`mb`,speaker:`amos`,expression:`smile`,text:`Morning! The crows think my scarecrow is their friend. Maybe it is.`,next:null}]),X(`mae_ch3_give`,`Mae: Crop cards`,[{id:`e1`,speaker:`mae`,expression:`smile`,text:`Carver said you'd come by! You need crop cards for Mr. Hill's fields?`,next:`e2`},{id:`e2`,speaker:`mae`,expression:`neutral`,text:`Four crops grow well around here: cotton, peanuts, cowpeas and sweet potatoes.`,choices:[{text:`What is a legume?`,next:`e3a`},{text:`Which one is best?`,next:`e3b`}]},{id:`e3a`,speaker:`mae`,expression:`curious`,text:`A legume is a plant in the bean family, like peanuts and cowpeas. Their roots have little bumps where helpful bacteria turn air into nitrogen, a plant food.`,next:`e4`},{id:`e3b`,speaker:`mae`,expression:`thinking`,text:`No single crop is best! It depends on what the soil needs and what the farmer needs. Peanuts and cowpeas are legumes, and they help the soil. That is what planning is for.`,next:`e4`},{id:`e4`,speaker:`mae`,expression:`smile`,effects:[{type:`grantItem`,itemId:`crop_cards`,from:`mae`},{type:`completeStep`,chapterId:`ch3`,stepId:`get_cards`}],text:`Take the whole set. I drew a little root with bumps on the legume cards.`,next:`e5`},{id:`e5`,speaker:`mae`,expression:`smile`,text:`Good luck! And tell Mr. Hill his seed order came in.`,next:null}]),X(`mae_ch3_after`,`Mae: Busy seed orders`,[{id:`ea`,speaker:`mae`,expression:`smile`,text:`Peanuts, cowpeas, sweet potatoes... I will be busy if your plan catches on!`,next:null}]),X(`mae_ambient`,`Mae: Seeds and letters`,[{id:`y1`,speaker:`mae`,expression:`smile`,text:`Seeds, letters and parcels. If it grows or it goes, it passes through here!`,next:null}]),X(`mae_ambient_night`,`Mae: Late letters`,[{id:`y2`,speaker:`mae`,expression:`smile`,text:`Evening! I keep my lantern lit so late letters can still find their way.`,next:null}]),X(`jojo_ambient`,`Jojo: Counting ladybugs`,[{id:`j1`,speaker:`jojo`,expression:`smile`,text:`I'm counting ladybugs! I've got seven. Or eight. They keep moving!`,choices:[{text:`Try counting their spots, too.`,next:`j2`},{text:`Good luck!`,next:null}]},{id:`j2`,speaker:`jojo`,expression:`curious`,text:`Ooh, this one has seven spots and that one has two. They're not all the same! I'm writing that down.`,next:null}]),X(`odell_ambient`,`Mr. Odell: Lighting the lamps`,[{id:`o1`,speaker:`odell`,expression:`smile`,text:`Evening, explorer. I light the lamps so everyone can find their way home.`,choices:[{text:`What do you see at night?`,next:`o2`},{text:`Good night!`,next:null}]},{id:`o2`,speaker:`odell`,expression:`curious`,text:`Moths around the lamps, frogs by the pond, and stars. Each star is a sun, very far away.`,next:null}])].map(e=>[e.id,e])),Bc={school_door:`The schoolhouse is closed for now. It opens in Chapter 2.`,farm_door:`The farm gate is latched. Mr. Hill opens the fields for lessons in Chapter 3.`,workshop_door:`The workshop is locked. The craftsperson will open it in Chapter 4.`,greenhouse_door:`Carver's greenhouse is full of seedlings and jars. He'll invite you in for later experiments.`,shop_door:`The Seed & Mail smells like paper and fresh soil. Mae is working at the stall out front.`,shelf:`An empty shelf. Things you earn on your adventures will go here.`,windowsill_empty:`A sunny windowsill. It would be a good spot for a plant.`,windowsill_planted:`Your seed pot from Carver. The soil is damp, and nothing has sprouted yet. Keep watching; scientists are patient.`},Vc={seed_packet:{id:`seed_packet`,name:`Mystery Seed Packet`,icon:`seedPacket`,description:`A paper packet of seeds that Carver ordered for his windowsill.`,lookCloser:[`The brown paper is soft and a little crumpled at the corners.`,`Inside are about twenty seeds. Each one is small, flat and tan, with a pointed tip.`,`The label says only: 'From a farm down south. Plant in spring.'`],purpose:`Carver asked you to bring it to him.`,chapterId:`practice`},field_notebook:{id:`field_notebook`,name:`Field Notebook`,icon:`notebook`,description:`Hattie Bell's garden notebook, with a green cloth cover.`,lookCloser:[`The first page shows how to write an observation: what you see, how many, what color, what size.`,`There's a pencil tucked into the spine.`,`Hattie has written "Beans chewed?? Soil by east fence always damp." on page two.`],purpose:`Record exactly what you observe in the garden.`,chapterId:`ch1`},magnifying_lens:{id:`magnifying_lens`,name:`Magnifying Lens`,icon:`lens`,description:`Theo's magnifying lens, with a smooth wooden handle.`,lookCloser:[`Through the glass, your fingertip looks like a map of tiny ridges.`,`Theo scratched his initials, T.O., into the handle.`,`It makes small things look about three times bigger.`],purpose:`Look closely at small details: edges, hairs, specks of pollen.`,chapterId:`ch1`},nature_card:{id:`nature_card`,name:`Nature Observation Card`,icon:`card`,description:`A card from Carver for observing nature in your own neighborhood.`,lookCloser:[`It has three empty boxes: something I SAW, something I HEARD, something I TOUCHED.`,`At the bottom it says: "Write what is there, not what you think happened."`],purpose:`An off-screen activity: take it outside (open it from the Journal to print).`,chapterId:`ch1`},school_record:{id:`school_record`,name:`School Record Folder`,icon:`folder`,description:`Ms. Nelson's folder of copied records about Carver's schooling.`,lookCloser:[`A record is something written down at the time, like a diploma or a letter.`,`Some pages have dates: "1870s", "about 1885", "1890", "1891 to 1896".`,`Two moments in the folder have no date at all. The displays will have to help.`],purpose:`Put dates on the timeline cards.`,chapterId:`ch2`},botanical_sketch:{id:`botanical_sketch`,name:`Botanical Sketch`,icon:`sketch`,description:`Ada's pencil drawing of a leaf, with every vein drawn in.`,lookCloser:[`Ada counted the veins before she drew them. Drawing is a way of looking closely.`,`In the corner she wrote: "Carver studied art first, then plants."`],purpose:`A clue about where art fits in Carver's journey.`,chapterId:`ch2`},journey_card:{id:`journey_card`,name:`Journey Card`,icon:`card`,description:`A card from Carver for making your own learning timeline.`,lookCloser:[`It has a long line with five empty dots, and a box that says "Someone who helped me".`,`At the bottom it says: "Every journey has helpers. Who are yours?"`],purpose:`An off-screen activity: draw a timeline of something you learned (open it from the Journal to print).`,chapterId:`ch2`},soil_samples:{id:`soil_samples`,name:`Soil Sample Jars`,icon:`jar`,description:`Two jars of soil from Mr. Hill's fields: one from the west plot and one from the east plot.`,lookCloser:[`The west jar is pale and dusty. It crumbles into hard little chunks.`,`The east jar is darker and smells like a forest floor.`,`Mr. Hill labeled them in pencil: "West" and "East".`],purpose:`Look at each plot's soil up close at the farm.`,chapterId:`ch3`},crop_history:{id:`crop_history`,name:`Crop History Ledger`,icon:`ledger`,description:`Mr. Hill's notebook of what he planted in each plot, year by year.`,lookCloser:[`West plot: cotton, cotton, cotton, cotton, cotton.`,`East plot: cotton, peanuts, cotton, cowpeas, cotton.`,`In the margin: "West cotton gets smaller every year. Why?"`],purpose:`Compare what each plot grew before.`,chapterId:`ch3`},crop_cards:{id:`crop_cards`,name:`Crop Cards`,icon:`cropcards`,description:`Mae's cards for four crops that grow well around here: cotton, peanuts, cowpeas and sweet potatoes.`,lookCloser:[`Peanuts and cowpeas have a little root drawn on them with bumps. Mae wrote "legume" next to it.`,`Cotton's card says: "Sells well. Hungry for nitrogen."`,`Sweet potato's card says: "Not a legume. Needs less nitrogen than cotton."`],purpose:`Plan which crop to plant each season.`,chapterId:`ch3`},rotation_card:{id:`rotation_card`,name:`Crop-Rotation Planner`,icon:`card`,description:`A paper planner from Carver with four season boxes and a cup-of-soil experiment.`,lookCloser:[`Four boxes in a circle: Season 1, Season 2, Season 3, Season 4.`,`At the bottom: "Try it with cups of soil and bean seeds, with a grown-up."`],purpose:`An off-screen activity: plan a rotation on paper or with cups of soil (open it from the Journal to print).`,chapterId:`ch3`}},Hc=Gs.find(e=>e.id===`gray`),Uc=Gs.find(e=>e.id===`black`),Wc=[{id:`carver`,name:`George Washington Carver`,role:`Scientist and your guide`,look:{build:`adult`,skin:{base:`#6e4329`,shade:`#573320`},hair:{style:`carver`,base:Hc.base,shade:Hc.shade,light:Hc.light},shirt:{base:`#f4efe4`,shade:`#d9d2c2`},pants:`#4a4038`,shoes:`#2f2521`,accessory:`none`,accent:G.flowerYellow,extras:{mustache:`#c9c5bf`,jacket:{base:`#6b5a4a`,shade:`#54463a`},tie:`#7a2f38`,lapelFlower:`#e0574f`}},portrait:`carver`,scene:`hub`,pos:{x:21.5,y:7.5},facing:`down`,presence:`always`,ambient:{default:`carver_ambient`},voice:180,required:!0},{id:`mae`,name:`Mae Porter`,role:`Keeper of the Seed & Mail`,look:{build:`adult`,skin:{base:`#9c6440`,shade:`#834f31`},hair:{style:`wrap`,base:Uc.base,shade:Uc.shade,light:Uc.light},shirt:{base:`#d9824a`,shade:`#b86a38`},pants:`#5a4a6b`,shoes:`#3a2a2a`,accessory:`none`,accent:`#4f9a4a`,extras:{apron:`#f1e3c6`}},portrait:`mae`,scene:`hub`,pos:{x:32.5,y:18.5},facing:`down`,presence:`always`,ambient:{default:`mae_ambient`,night:`mae_ambient_night`},voice:300,lanternAtNight:!0,required:!0},{id:`jojo`,name:`Jojo`,role:`Bug watcher`,look:{build:`kid`,skin:{base:`#5a3825`,shade:`#462a1b`},hair:{style:`short`,base:Uc.base,shade:Uc.shade,light:Uc.light},shirt:{base:`#e8bd3f`,shade:`#c29a2c`},pants:`#4b7fcf`,shoes:`#c9483f`,accessory:`cap`,accent:`#c9483f`},portrait:`jojo`,scene:`hub`,pos:{x:14.5,y:20.5},facing:`right`,presence:`day`,ambient:{default:`jojo_ambient`},voice:420},{id:`odell`,name:`Mr. Odell`,role:`Lamplighter`,look:{build:`adult`,skin:{base:`#c08a5c`,shade:`#a47049`},hair:{style:`short`,base:Hc.base,shade:Hc.shade,light:Hc.light},shirt:{base:`#3e5a88`,shade:`#2f466b`},pants:`#3a3a44`,shoes:`#2f2521`,accessory:`cap`,accent:`#46703e`,extras:{beard:`#b9b7b4`,mustache:`#b9b7b4`}},portrait:`odell`,scene:`hub`,pos:{x:22.5,y:15.6},facing:`left`,presence:`night`,ambient:{default:`odell_ambient`},voice:140,lanternAtNight:!0}];Wc.push({id:`hattie`,name:`Hattie Bell`,role:`Community gardener`,look:{build:`adult`,skin:{base:`#7a4a2e`,shade:`#633b23`},hair:{style:`bun`,base:Hc.base,shade:Hc.shade,light:Hc.light},shirt:{base:`#e7d9b8`,shade:`#cdbd98`},pants:`#3e5a88`,shoes:`#4a3326`,accessory:`sunhat`,accent:`#4f9a4a`,extras:{apron:`#4b6fa8`}},portrait:`hattie`,scene:`hub`,pos:{x:13.5,y:8.4},facing:`down`,presence:`always`,ambient:{default:`hattie_ambient`},voice:240,required:!0},{id:`theo`,name:`Theo`,role:`Young naturalist`,look:{build:`kid`,skin:{base:`#9c6440`,shade:`#834f31`},hair:{style:`curly`,base:Uc.base,shade:Uc.shade,light:Uc.light},shirt:{base:`#c9b27a`,shade:`#a8925e`},pants:`#5d4a33`,shoes:`#3a2a22`,accessory:`glasses`,accent:`#e0823a`},portrait:`theo`,scene:`hub`,pos:{x:25.5,y:19.5},facing:`left`,presence:`always`,ambient:{default:`theo_ambient`},voice:380,required:!0}),Wc.push({id:`ruth`,name:`Ms. Ruth Nelson`,role:`Schoolteacher`,look:{build:`adult`,skin:{base:`#5a3825`,shade:`#462a1b`},hair:{style:`bun`,base:Uc.base,shade:Uc.shade,light:Uc.light},shirt:{base:`#2f7a6a`,shade:`#235e51`},pants:`#3a3a44`,shoes:`#2f2521`,accessory:`glasses`,accent:G.flowerYellow},portrait:`ruth`,scene:`hub`,pos:{x:4.5,y:25.5},facing:`right`,presence:`always`,ambient:{default:`ruth_ambient`},voice:260,required:!0},{id:`ada`,name:`Ada`,role:`Young artist`,look:{build:`kid`,skin:{base:`#dcaa7e`,shade:`#c38f65`},hair:{style:`braids`,base:`#9c4a2c`,shade:`#7a3620`,light:`#bd6440`},shirt:{base:`#e0823a`,shade:`#bb652a`},pants:`#4a5a7a`,shoes:`#3a2a22`,accessory:`headband`,accent:`#4b7fcf`},portrait:`ada`,scene:`hub`,pos:{x:15.5,y:12.5},facing:`down`,presence:`always`,ambient:{default:`ada_ambient`},voice:400,required:!0}),Wc.push({id:`amos`,name:`Mr. Amos Hill`,role:`Farmer at Hilltop Farm`,look:{build:`adult`,skin:{base:`#4e3020`,shade:`#3c2418`},hair:{style:`short`,base:Hc.base,shade:Hc.shade,light:Hc.light},shirt:{base:`#b8513a`,shade:`#963f2d`},pants:`#3e5a88`,shoes:`#3a2a22`,accessory:`cap`,accent:`#d9b25a`,extras:{beard:`#bdb8b0`}},portrait:`amos`,scene:`hub`,pos:{x:31.5,y:8.4},facing:`down`,presence:`always`,ambient:{default:`amos_ambient`},voice:150,required:!0});function Gc(e){return Wc.find(t=>t.id===e)}var Kc=`carver`;function qc(e=`locked`){return{stage:e,stepsDone:[],flags:[],rewarded:!1}}var Jc=class{constructor(e,t,n,r,i=()=>Date.now()){K(this,`chapters`,void 0),K(this,`items`,void 0),K(this,`state`,void 0),K(this,`bus`,void 0),K(this,`now`,void 0),K(this,`byId`,new Map),this.chapters=e,this.items=t,this.state=n,this.bus=r,this.now=i,e.forEach(e=>this.byId.set(e.id,e)),this.refreshUnlocks()}allChapters(){return[...this.chapters].sort((e,t)=>e.number-t.number)}getChapter(e){return this.byId.get(e)}progress(e){return this.state.chapters[e]||(this.state.chapters[e]=qc()),this.state.chapters[e]}currentChapter(){for(let e of this.allChapters()){let t=this.progress(e.id);if(t.stage===`active`||t.stage===`available`)return e}return null}readyToReturn(e){let t=this.byId.get(e);if(!t)return!1;let n=this.progress(e);return n.stage===`active`&&t.steps.every(e=>n.stepsDone.includes(e.id))}openSteps(e){let t=this.byId.get(e);if(!t)return[];let n=this.progress(e);return t.steps.filter(e=>!n.stepsDone.includes(e.id))}hasItem(e){return this.state.inventory.some(t=>t.itemId===e)}inventoryEntry(e){return this.state.inventory.find(t=>t.itemId===e)}itemDef(e){return this.items[e]}conversationFor(e){let t=this.currentChapter();if(e===`carver`){if(t)return this.progress(t.id).stage===`available`?t.carver.opening:this.readyToReturn(t.id)?t.carver.closing:t.carver.waiting;let e=this.allChapters().filter(e=>this.progress(e.id).stage===`complete`),n=e[e.length-1];return n?n.carver.after:null}if(t&&this.progress(t.id).stage===`active`){let n=this.openSteps(t.id).find(t=>t.kind===`talk`&&t.npcId===e);if(n&&n.kind===`talk`)return n.conversation}for(let t of[...this.allChapters()].reverse()){let n=this.progress(t.id),r=t.steps.find(t=>t.kind===`talk`&&t.npcId===e&&n.stepsDone.includes(t.id));if(r&&r.kind===`talk`&&r.after)return r.after}return null}markerFor(e){let t=this.currentChapter();if(!t)return null;let n=this.progress(t.id);return e===`carver`?n.stage===`available`?`quest`:this.readyToReturn(t.id)?`turnin`:null:n.stage===`active`&&this.openSteps(t.id).some(t=>t.kind===`talk`&&t.npcId===e)?`lead`:null}nextAction(){let e=this.currentChapter();if(!e){let e=this.allChapters().find(e=>this.progress(e.id).stage!==`complete`);return{text:e?`Chapter ${e.number} is unlocked and arrives in the next update. Explore, rest in your room, or chat with Carver.`:`You finished every chapter! Visit Carver any time.`,targetNpcId:void 0}}if(this.progress(e.id).stage===`available`)return{text:`Talk to George Washington Carver`,targetNpcId:Kc};if(this.readyToReturn(e.id))return{text:`Return to Carver with what you found`,targetNpcId:Kc};let t=this.openSteps(e.id)[0];return t.kind===`talk`?{text:t.text,targetNpcId:t.npcId}:{text:t.text,targetPlaceId:t.placeId}}leads(e){let t=this.byId.get(e);if(!t)return[];let n=this.progress(e);return t.steps.filter(e=>e.kind===`talk`).map(e=>({npcId:e.npcId,lead:e.lead,done:n.stepsDone.includes(e.id)}))}itemChecklist(e){let t=this.byId.get(e);return t?t.requiredItems.map(e=>this.items[e]).filter(Boolean).map(e=>{let t=this.inventoryEntry(e.id);return{item:e,collected:!!t,used:!!t?.used,usedIn:t?.usedIn}}):[]}apply(e){switch(e.type){case`acceptQuest`:{let t=this.progress(e.chapterId);t.stage===`available`&&(t.stage=`active`,this.bus?.emit(`quest:changed`,{chapterId:e.chapterId}));break}case`grantItem`:this.grantItem(e.itemId,e.from);break;case`useItem`:this.useItem(e.itemId,e.usedIn);break;case`completeStep`:{let t=this.progress(e.chapterId);t.stage===`active`&&!t.stepsDone.includes(e.stepId)&&(t.stepsDone.push(e.stepId),this.bus?.emit(`quest:changed`,{chapterId:e.chapterId}));break}case`setFlag`:{let t=this.progress(e.chapterId);t.flags.includes(e.flag)||t.flags.push(e.flag);break}case`completeChapter`:this.completeChapter(e.chapterId)}}grantItem(e,t){return!this.items[e]||this.hasItem(e)?!1:(this.state.inventory.push({itemId:e,from:t,obtainedAt:this.now(),used:!1,inspected:!1}),this.bus?.emit(`item:granted`,{itemId:e,from:t}),!0)}useItem(e,t){let n=this.inventoryEntry(e);return!n||n.used?!1:(n.used=!0,n.usedIn=t,this.bus?.emit(`item:used`,{itemId:e,usedIn:t}),!0)}markInspected(e){let t=this.inventoryEntry(e);t&&(t.inspected=!0)}completeChapter(e){let t=this.byId.get(e);if(!t)return;let n=this.progress(e);(n.stage===`active`||n.stage===`complete`)&&(n.stage!==`active`||this.readyToReturn(e))&&(n.stage=`complete`,n.completedAt??(n.completedAt=this.now()),n.rewarded||(n.rewarded=!0,this.state.xp+=t.rewards.xp,this.state.seeds+=t.rewards.seeds,this.bus?.emit(`chapter:completed`,{chapterId:e,xp:t.rewards.xp,seeds:t.rewards.seeds}),this.bus?.emit(`rewards:changed`,{xp:this.state.xp,seeds:this.state.seeds})),this.refreshUnlocks(),this.bus?.emit(`quest:changed`,{chapterId:e}))}isUnlocked(e){let t=this.allChapters(),n=t.findIndex(t=>t.id===e);return n<=0?n===0:this.progress(t[n-1].id).stage===`complete`}refreshUnlocks(){let e=!0;for(let t of this.allChapters()){let n=this.progress(t.id);n.stage===`locked`&&e&&t.status===`playable`&&(n.stage=`available`),e=n.stage===`complete`}}};function Yc(e){return{level:Math.floor(e/100)+1,into:e%100,needed:100}}var Z=Math.SQRT2;function Xc(e){return e}function Zc(e){return e*Z}var Qc=class{constructor(e){K(this,`host`,void 0),K(this,`renderer`,void 0),K(this,`camera`,void 0),K(this,`canvas`,void 0),K(this,`internalW`,320),K(this,`internalH`,180),K(this,`scale`,1),K(this,`cssW`,0),K(this,`cssH`,0),K(this,`offsetX`,0),K(this,`offsetY`,0),K(this,`mapW`,40),K(this,`mapH`,30),K(this,`target`,new R(0,0)),K(this,`ray`,new Ii),K(this,`groundPlane`,new Xr(new z(0,1,0),0)),this.host=e,this.renderer=new Us({antialias:!1,alpha:!1,powerPreference:`default`}),this.renderer.setPixelRatio(1),this.renderer.outputColorSpace=Fe,this.canvas=this.renderer.domElement,this.canvas.className=`game-canvas`,this.canvas.setAttribute(`aria-hidden`,`true`),e.appendChild(this.canvas),this.camera=new xi(-10,10,10,-10,.1,400),this.resize()}setBounds(e,t){this.mapW=e,this.mapH=t}resize(){let e=window.devicePixelRatio||1;this.cssW=this.host.clientWidth||window.innerWidth,this.cssH=this.host.clientHeight||window.innerHeight;let t=Math.round(this.cssW*e),n=Math.round(this.cssH*e),r=Math.max(1,Math.round(Math.min(t/220,n/250)));this.scale=r,this.internalW=Math.ceil(t/r),this.internalH=Math.ceil(n/r),this.renderer.setSize(this.internalW,this.internalH,!1);let i=this.internalW*r/e,a=this.internalH*r/e;this.offsetX=Math.floor((this.cssW-i)/2),this.offsetY=Math.floor((this.cssH-a)/2),Object.assign(this.canvas.style,{width:`${i}px`,height:`${a}px`,left:`${this.offsetX}px`,top:`${this.offsetY}px`});let o=this.internalW/16,s=this.internalH/16;this.camera.left=-o/2,this.camera.right=o/2,this.camera.top=s/2,this.camera.bottom=-s/2,this.camera.updateProjectionMatrix(),this.applyCamera()}get viewTiles(){return{w:this.internalW/16,h:this.internalH/16}}lookAt(e,t,n=0){let{w:r,h:i}=this.viewTiles,a=(e,t,n)=>n>=t?t/2:Math.min(t-n/2,Math.max(n/2,e)),o=a(e,this.mapW,r),s=a(t,this.mapH,i);n>0?(this.target.x+=(o-this.target.x)*n,this.target.y+=(s-this.target.y)*n):this.target.set(o,s),this.applyCamera()}applyCamera(){let e=Math.round(this.target.x*16)/16,t=Math.round(this.target.y*16)/16,n=Xc(e),r=Zc(t);this.camera.position.set(n,100*Math.SQRT1_2,r+100*Math.SQRT1_2),this.camera.lookAt(n,0,r),this.camera.updateMatrixWorld()}render(e){this.renderer.render(e,this.camera)}project(e){let t=e.clone().project(this.camera),n=this.canvas.clientWidth,r=this.canvas.clientHeight,i=this.offsetX+(t.x+1)/2*n,a=this.offsetY+(1-t.y)/2*r;return{x:i,y:a,visible:i>=0&&a>=0&&i<=this.cssW&&a<=this.cssH}}screenToTile(e,t){let n=this.canvas.clientWidth,r=this.canvas.clientHeight,i=new R((e-this.offsetX)/n*2-1,-((t-this.offsetY)/r*2-1));this.ray.setFromCamera(i,this.camera);let a=new z;return this.ray.ray.intersectPlane(this.groundPlane,a)?{x:a.x,y:a.z/Z}:null}get hostSize(){return{w:this.cssW,h:this.cssH}}},$c=`seedsOfGenius.settings`;function el(){try{return window.matchMedia(`(prefers-reduced-motion: reduce)`).matches}catch{return!1}}function tl(){return{musicVolume:.5,sfxVolume:.7,muted:!1,reducedMotion:el(),textSpeed:`normal`,textSize:`normal`,touchControls:`auto`}}function nl(e){let t=tl();if(typeof e!=`object`||!e)return t;let n=e,r=(e,t)=>typeof e==`number`&&Number.isFinite(e)?Math.min(1,Math.max(0,e)):t,i=(e,t,n)=>t.includes(e)?e:n;return{musicVolume:r(n.musicVolume,t.musicVolume),sfxVolume:r(n.sfxVolume,t.sfxVolume),muted:n.muted===!0,reducedMotion:typeof n.reducedMotion==`boolean`?n.reducedMotion:t.reducedMotion,textSpeed:i(n.textSpeed,[`slow`,`normal`,`fast`,`instant`],t.textSpeed),textSize:i(n.textSize,[`normal`,`large`],t.textSize),touchControls:i(n.touchControls,[`auto`,`on`,`off`],t.touchControls)}}function rl(){try{let e=window.localStorage.getItem($c);return e?nl(JSON.parse(e)):tl()}catch{return tl()}}var il=rl();function al(e){Object.assign(il,nl({...il,...e}));try{window.localStorage.setItem($c,JSON.stringify(il))}catch{}ol(),Y.emit(`settings:changed`,{})}function ol(){let e=document.documentElement;e.dataset.textSize=il.textSize,e.dataset.reducedMotion=il.reducedMotion?`true`:`false`}function sl(){try{return window.matchMedia(`(pointer: coarse)`).matches||`ontouchstart`in window}catch{return!1}}function cl(){return il.touchControls===`on`||il.touchControls!==`off`&&sl()}function ll(){return{slow:28,normal:55,fast:110,instant:0}[il.textSpeed]}var ul=e=>440*2**((e-69)/12),dl={day:{bpm:92,chords:[[65,69,72],[62,65,69],[58,62,65],[60,64,67]],bass:[41,38,34,36],melody:[77,null,76,74,72,null,74,null,72,null,69,null,70,72,null,null,74,null,72,70,69,null,67,null,72,null,null,69,67,null,65,null],lead:`triangle`},title:{bpm:84,chords:[[65,69,72],[60,64,67],[62,65,69],[58,62,65]],bass:[41,36,38,34],melody:[72,null,null,74,76,null,72,null,71,null,72,null,67,null,null,null,69,null,72,null,74,null,72,69,70,null,69,null,65,null,null,null],lead:`triangle`},night:{bpm:68,chords:[[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62]],bass:[45,41,36,43],melody:[76,null,null,null,72,null,null,null,77,null,null,76,72,null,null,null,79,null,null,null,76,null,74,null,74,null,null,null,71,null,null,null],lead:`sine`}},Q=new class{constructor(){K(this,`ctx`,null),K(this,`master`,void 0),K(this,`musicGain`,void 0),K(this,`sfxGain`,void 0),K(this,`ambGain`,void 0),K(this,`mood`,`title`),K(this,`nextStepTime`,0),K(this,`stepIndex`,0),K(this,`nightAmbience`,!1),Y.on(`settings:changed`,()=>this.applyVolumes())}unlock(){if(this.ctx){this.ctx.state===`suspended`&&this.ctx.resume();return}let e=window.AudioContext??window.webkitAudioContext;if(!e)return;try{this.ctx=new e}catch{return}let t=this.ctx;this.master=t.createGain(),this.master.connect(t.destination),this.musicGain=t.createGain(),this.musicGain.connect(this.master),this.sfxGain=t.createGain(),this.sfxGain.connect(this.master),this.ambGain=t.createGain(),this.ambGain.connect(this.sfxGain),this.applyVolumes(),this.nextStepTime=t.currentTime+.1,window.setInterval(()=>this.schedule(),60),window.setInterval(()=>this.ambient(),900)}get unlocked(){return!!this.ctx}applyVolumes(){if(!this.ctx)return;let e=this.ctx.currentTime;this.master.gain.setTargetAtTime(+!il.muted,e,.05),this.musicGain.gain.setTargetAtTime(il.musicVolume*.32,e,.1),this.sfxGain.gain.setTargetAtTime(il.sfxVolume*.6,e,.05),this.ambGain.gain.setTargetAtTime(.5,e,.1)}setMood(e){e!==this.mood&&(this.mood=e,this.stepIndex=0)}setNightAmbience(e){this.nightAmbience=e}schedule(){let e=this.ctx;if(!e||e.state!==`running`)return;let t=dl[this.mood],n=60/t.bpm/2;for(;this.nextStepTime<e.currentTime+.25;){let e=Math.floor(this.stepIndex/8)%t.chords.length,r=this.stepIndex%8,i=this.nextStepTime;r===0&&(t.chords[e].forEach(e=>this.tone(ul(e),i,n*8,`triangle`,.05,this.musicGain,.4,1.2)),this.tone(ul(t.bass[e]),i,n*3,`sine`,.16,this.musicGain,.02,.3)),r===4&&this.tone(ul(t.bass[e]+7),i,n*3,`sine`,.1,this.musicGain,.02,.3);let a=t.melody[this.stepIndex%t.melody.length];a!==null&&(this.tone(ul(a),i,n*1.6,t.lead,.07,this.musicGain,.01,.35),this.mood===`night`&&this.tone(ul(a),i+n*1.5,n,`sine`,.025,this.musicGain,.01,.4)),this.nextStepTime+=n,this.stepIndex++}}tone(e,t,n,r,i,a,o=.01,s=.15){let c=this.ctx,l=c.createOscillator(),u=c.createGain();l.type=r,l.frequency.setValueAtTime(e,t),u.gain.setValueAtTime(0,t),u.gain.linearRampToValueAtTime(i,t+o),u.gain.setValueAtTime(i,t+Math.max(o,n-s)),u.gain.linearRampToValueAtTime(0,t+n+s),l.connect(u),u.connect(a),l.start(t),l.stop(t+n+s+.05)}ambient(){let e=this.ctx;if(!e||e.state!==`running`)return;let t=e.currentTime;if(this.nightAmbience){if(Math.random()<.55){let e=4200+Math.random()*500;for(let n=0;n<3;n++)this.tone(e,t+n*.07,.03,`sine`,.012,this.ambGain,.005,.02)}}else if(this.mood!==`title`&&Math.random()<.3){let n=2200+Math.random()*900;[0,.14].forEach((r,i)=>{let a=e.createOscillator(),o=e.createGain();a.type=`sine`,a.frequency.setValueAtTime(n*(1+i*.1),t+r),a.frequency.exponentialRampToValueAtTime(n*1.35,t+r+.09),o.gain.setValueAtTime(0,t+r),o.gain.linearRampToValueAtTime(.018,t+r+.02),o.gain.linearRampToValueAtTime(0,t+r+.1),a.connect(o),o.connect(this.ambGain),a.start(t+r),a.stop(t+r+.12)})}}fx(e,t=`triangle`,n=.12){let r=this.ctx;if(!r)return;let i=r.currentTime;e.forEach(([e,r,a])=>this.tone(ul(e),i+r,a,t,n,this.sfxGain,.005,.08))}click(){this.fx([[84,0,.03]],`square`,.04)}open(){this.fx([[72,0,.05],[79,.05,.07]],`triangle`,.08)}close(){this.fx([[79,0,.05],[72,.05,.07]],`triangle`,.07)}blip(e){let t=this.ctx;t&&this.tone(e*(.95+Math.random()*.1),t.currentTime,.035,`square`,.025,this.sfxGain,.004,.03)}step(){let e=this.ctx;e&&this.tone(90+Math.random()*30,e.currentTime,.03,`triangle`,.05,this.sfxGain,.002,.03)}itemGet(){this.fx([[72,0,.08],[76,.08,.08],[79,.16,.08],[84,.24,.25]],`square`,.06)}questAccept(){this.fx([[67,0,.1],[72,.1,.2]],`triangle`,.12)}questComplete(){this.fx([[72,0,.12],[76,.12,.12],[79,.24,.12],[84,.36,.12],[88,.48,.4]],`triangle`,.12)}correct(){this.fx([[76,0,.08],[84,.08,.18]],`triangle`,.1)}retry(){this.fx([[67,0,.1],[65,.1,.16]],`sine`,.1)}door(){this.fx([[55,0,.06],[50,.07,.1]],`square`,.05)}rest(){this.fx([[72,0,.3],[67,.3,.3],[64,.6,.3],[60,.9,.6]],`sine`,.1)}},fl=.5,pl=[{h:0,tint:[.5,.56,.8],night:1},{h:4.5,tint:[.5,.56,.8],night:1},{h:6,tint:[.95,.8,.78],night:.25},{h:7.5,tint:[1,1,1],night:0},{h:17,tint:[1,1,1],night:0},{h:18.5,tint:[1,.86,.68],night:.1},{h:19.5,tint:[.78,.66,.82],night:.55},{h:20.5,tint:[.5,.56,.8],night:1},{h:24,tint:[.5,.56,.8],night:1}];function ml(e){let t=(e%1440+1440)%1440/60;for(let e=0;e<pl.length-1;e++){let n=pl[e],r=pl[e+1];if(t>=n.h&&t<=r.h){let e=r.h===n.h?0:(t-n.h)/(r.h-n.h),i=e*e*(3-2*e);return{tint:[0,1,2].map(e=>n.tint[e]+(r.tint[e]-n.tint[e])*i),night:n.night+(r.night-n.night)*i}}}return{tint:[1,1,1],night:0}}function hl(e){let t=(e%1440+1440)%1440/60;return t>=5&&t<11?`morning`:t>=11&&t<17?`day`:t>=17&&t<20?`evening`:`night`}function gl(e,t){if(e===`always`)return!0;let n=(t%1440+1440)%1440/60;return e===`day`?n>=6&&n<19:n>=18||n<6}function _l(e){let t=Math.floor((e%1440+1440)%1440),n=Math.floor(t/60),r=String(t%60).padStart(2,`0`);return`${n%12==0?12:n%12}:${r} ${n<12?`AM`:`PM`}`}var vl=class{constructor(){K(this,`held`,new Set),K(this,`virtual`,{x:0,y:0}),K(this,`actionHandlers`,new Set),K(this,`worldActive`,!0),K(this,`run`,!1),window.addEventListener(`keydown`,e=>this.onKey(e,!0)),window.addEventListener(`keyup`,e=>this.onKey(e,!1)),window.addEventListener(`blur`,()=>this.held.clear())}onAction(e){return this.actionHandlers.add(e),()=>this.actionHandlers.delete(e)}emit(e){this.actionHandlers.forEach(t=>t(e))}onKey(e,t){let n=e.target;if(n&&(n.tagName===`INPUT`||n.tagName===`TEXTAREA`||n.tagName===`SELECT`||n.isContentEditable))return;let r=e.key.toLowerCase();if([`w`,`a`,`s`,`d`,`arrowup`,`arrowdown`,`arrowleft`,`arrowright`].includes(r)){t&&this.worldActive?(this.held.add(r),e.preventDefault()):this.held.delete(r);return}if(r===`shift`&&(this.run=t),!t||e.repeat)return;let i=!!n&&(n.tagName===`BUTTON`||n.getAttribute(`role`)===`button`||n.tagName===`A`);(r===`e`||(r===` `||r===`enter`)&&!i)&&this.worldActive?(e.preventDefault(),this.emit(`interact`)):r===`j`?this.emit(`journal`):r===`i`?this.emit(`bag`):r===`m`?this.emit(`mute`):r===`escape`&&this.emit(`menu`)}setVirtual(e,t){this.virtual.x=e,this.virtual.y=t}clear(){this.held.clear(),this.virtual.x=0,this.virtual.y=0}direction(){if(!this.worldActive)return{x:0,y:0};let e=this.virtual.x,t=this.virtual.y,n=this.held;(n.has(`a`)||n.has(`arrowleft`))&&--e,(n.has(`d`)||n.has(`arrowright`))&&(e+=1),(n.has(`w`)||n.has(`arrowup`))&&--t,(n.has(`s`)||n.has(`arrowdown`))&&(t+=1);let r=Math.hypot(e,t);return r>1?{x:e/r,y:t/r}:{x:e,y:t}}},yl=`seedsOfGenius.save`,bl=`seedsOfGenius.save.backup`,xl=`seedsOfGenius.save.unreadable`;function Sl(e=Date.now()){return{version:2,createdAt:e,savedAt:e,customized:!1,appearance:{...$s},world:{scene:`hub`,x:5.5,y:18.5,facing:`down`},time:{minutes:480,day:1,paused:!1},progress:{xp:0,seeds:0,chapters:{},inventory:[]},learner:{},log:[],tips:[],chapterData:{},memories:[]}}var Cl=e=>typeof e==`object`&&!!e&&!Array.isArray(e),wl=(e,t,n=-1/0,r=1/0)=>typeof e==`number`&&Number.isFinite(e)?Math.min(r,Math.max(n,e)):t,Tl=(e,t)=>typeof e==`string`?e:t,El=(e,t,n)=>t.includes(e)?e:n,Dl=(e,t=500)=>Array.isArray(e)?e.filter(e=>typeof e==`string`).slice(0,t):[];function Ol(e){let t=Cl(e)?e:{},n=$s;return{skin:El(t.skin,Ws.map(e=>e.id),n.skin),hairStyle:El(t.hairStyle,qs.map(e=>e.id),n.hairStyle),hairColor:El(t.hairColor,Gs.map(e=>e.id),n.hairColor),outfit:El(t.outfit,Ks.map(e=>e.id),n.outfit),accessory:El(t.accessory,Js.map(e=>e.id),n.accessory)}}function kl(e){return Cl(e)?{stage:El(e.stage,[`locked`,`available`,`active`,`complete`],`locked`),stepsDone:Dl(e.stepsDone,50),flags:Dl(e.flags,100),rewarded:e.rewarded===!0,completedAt:typeof e.completedAt==`number`?e.completedAt:void 0}:null}function Al(e){if(!Array.isArray(e))return[];let t=new Set,n=[];for(let r of e)Cl(r)&&typeof r.itemId==`string`&&!t.has(r.itemId)&&(t.add(r.itemId),n.push({itemId:r.itemId,from:Tl(r.from,`unknown`),obtainedAt:wl(r.obtainedAt,0),used:r.used===!0,usedIn:typeof r.usedIn==`string`?r.usedIn:void 0,inspected:r.inspected===!0}));return n}function jl(e){let t={};if(!Cl(e))return t;for(let[n,r]of Object.entries(e))Cl(r)&&(t[n]={attempts:wl(r.attempts,0,0),correct:wl(r.correct,0,0),hintLevel:wl(r.hintLevel,0,0,3),misconception:typeof r.misconception==`string`?r.misconception:null,evidence:Dl(r.evidence,12),mastered:r.mastered===!0});return t}function Ml(e,t=Date.now()){let n=Sl(t),r=Cl(e.world)?e.world:{},i=Cl(e.time)?e.time:{},a=Cl(e.progress)?e.progress:{},o={};if(Cl(a.chapters))for(let[e,t]of Object.entries(a.chapters)){let n=kl(t);n&&(o[e]=n)}return{version:2,createdAt:wl(e.createdAt,n.createdAt),savedAt:wl(e.savedAt,n.savedAt),customized:e.customized===!0,appearance:Ol(e.appearance),world:{scene:El(r.scene,[`hub`,`room`,`school`,`farm`],`hub`),x:wl(r.x,n.world.x,0,60),y:wl(r.y,n.world.y,0,60),facing:El(r.facing,Qs,`down`)},time:{minutes:wl(i.minutes,n.time.minutes,0,1439.99),day:Math.floor(wl(i.day,1,1,1e5)),paused:i.paused===!0},progress:{xp:Math.floor(wl(a.xp,0,0,1e7)),seeds:Math.floor(wl(a.seeds,0,0,1e7)),chapters:o,inventory:Al(a.inventory)},learner:jl(e.learner),log:Array.isArray(e.log)?e.log.filter(e=>Cl(e)&&typeof e.conversationId==`string`).slice(-200).map(e=>({conversationId:e.conversationId,npcId:Tl(e.npcId,``),at:wl(e.at,0)})):[],tips:Dl(e.tips,100),chapterData:Nl(e.chapterData),memories:Dl(e.memories,50)}}function Nl(e){let t={};if(!Cl(e))return t;for(let[n,r]of Object.entries(e))if(Cl(r))try{let e=JSON.stringify(r);e.length<=5e4&&(t[n]=JSON.parse(e))}catch{}return t}function Pl(e){if(!Cl(e))return{data:null,reason:`not an object`};let t={...e},n=typeof t.version==`number`?t.version:0;return n>2?{data:null,reason:`made by a newer version (${n})`}:(n===0&&(t={...t,world:{scene:t.scene??`hub`,x:t.x,y:t.y,facing:t.facing},time:{minutes:t.timeMinutes,paused:t.timePaused,day:1},version:1},n=1),n===1&&(t={...t,chapterData:t.chapterData??{},memories:t.memories??[],version:2},n=2),{data:Ml(t)})}function Fl(e){let t=5381;for(let n=0;n<e.length;n++)t=(t<<5)+t+e.charCodeAt(n)|0;return(t>>>0).toString(36)}function Il(e){let t=JSON.stringify(e);return JSON.stringify({sum:Fl(t),body:t})}function Ll(e){let t;try{t=JSON.parse(e)}catch{return{data:null,reason:`not valid JSON`}}if(Cl(t)&&typeof t.body==`string`){if(t.sum!==Fl(t.body))return{data:null,reason:`checksum mismatch`};try{return Pl(JSON.parse(t.body))}catch{return{data:null,reason:`damaged body`}}}return Pl(t)}function Rl(){try{let e=window.localStorage,t=`__sog_probe__`;return e.setItem(t,`1`),e.removeItem(t),e}catch{return null}}var zl=class{constructor(e){K(this,`storage`,void 0),this.storage=e===void 0?Rl():e}get available(){return this.storage!==null}hasSave(){try{return!!this.storage?.getItem(`seedsOfGenius.save`)||!!this.storage?.getItem(`seedsOfGenius.save.backup`)}catch{return!1}}load(){let e=this.storage;if(!e)return{data:Sl(),status:`fresh`,reason:`storage unavailable`};let t=null,n=null;try{t=e.getItem(yl),n=e.getItem(bl)}catch{return{data:Sl(),status:`fresh`,reason:`storage unavailable`}}if(!t&&!n)return{data:Sl(),status:`fresh`};if(t){let e=Ll(t);if(e.data)return{data:e.data,status:`loaded`};if(this.quarantine(t),n){let t=Ll(n);if(t.data)return this.write(t.data),{data:t.data,status:`recovered`,reason:e.reason}}return{data:Sl(),status:`unreadable`,reason:e.reason}}let r=Ll(n);return r.data?{data:r.data,status:`recovered`,reason:`main save missing`}:{data:Sl(),status:`unreadable`,reason:r.reason}}save(e,t=Date.now()){return e.savedAt=t,this.write(e)}write(e){if(!this.storage)return!1;try{let t=Il(e),n=this.storage.getItem(yl);return n&&Ll(n).data&&this.storage.setItem(bl,n),this.storage.setItem(yl,t),n||this.storage.setItem(bl,t),!0}catch{return!1}}quarantine(e){try{this.storage?.setItem(xl,e)}catch{}}reset(){try{this.storage?.removeItem(yl),this.storage?.removeItem(bl)}catch{}}exportText(e){return JSON.stringify({game:`seeds-of-genius`,...JSON.parse(Il(e))},null,0)}importText(e){return Ll(e)}},Bl=[[G.leaf4,G.leaf1,G.leaf2,G.leaf3],[`#2f6a3a`,`#3f8448`,`#5aa25a`,`#7cc06a`],[`#35713a`,`#4a8d3f`,`#69a94c`,`#8fc762`]];function Vl(e){let t=new q(32,42),[n,r,i,a]=Bl[e%Bl.length];t.rect(13,26,6,13,G.trunk),t.vline(13,27,38,J(G.trunk,G.outline,.3)),t.hline(11,20,39,G.trunk),t.set(15,30,J(G.trunk,G.outline,.4)),t.ellipse(2,3,28,26,n),t.ellipse(3,2,25,22,r),t.ellipse(5,3,12,11,i),t.ellipse(15,5,11,9,i),t.ellipse(7,4,6,5,a),t.ellipse(17,6,5,4,a);for(let a=3;a<28;a++)for(let o=2;o<30;o++){let s=t.get(o,a);s&&(s===r||s===i)&&mc(o,a,e+11)>.86&&t.set(o,a,s===r?n:r)}if(e===2)for(let e=0;e<14;e++){let n=5+Math.floor(mc(e,3,5)*22),r=5+Math.floor(mc(e,7,5)*18);t.get(n,r)&&t.set(n,r,e%2?G.flowerPink:G.flowerWhite)}return t.outline()}function Hl(e){let t=new q(24,42),[n,r,i]=Bl[e%Bl.length];t.rect(10,32,4,8,G.trunk);for(let e of[{y:2,h:12,w:10},{y:9,h:13,w:16},{y:17,h:16,w:22}])for(let a=0;a<e.h;a++){let o=Math.round((a+1)/e.h*(e.w/2));t.hline(12-o,11+o,e.y+a,a>e.h-3?n:r),t.hline(12-o,12-Math.max(0,o-2),e.y+a,i)}return t.outline()}function Ul(e){let t=new q(18,15);return t.ellipse(1,2,16,12,G.leaf1),t.ellipse(2,1,9,8,G.leaf2),t.ellipse(9,3,7,6,G.leaf2),t.set(4,3,G.leaf3),t.set(11,4,G.leaf3),e===1&&[[5,6],[11,8],[8,4],[13,6]].forEach(([e,n])=>t.set(e,n,G.flowerRed)),t.outline()}function Wl(){let e=new q(10,34);return e.rect(4,9,2,23,G.metal),e.vline(4,9,31,G.metalLight),e.hline(2,7,32,G.metal),e.hline(2,7,2,G.metal),e.hline(3,6,1,G.metal),e.rect(2,3,6,5,G.metal),e.rect(3,3,4,4,`#f3e3b5`),e.hline(2,7,8,G.metal),e.outline()}function Gl(){let e=new q(32,16);return e.rect(2,2,28,3,G.wood1),e.hline(2,29,2,G.wood3),e.rect(2,7,28,3,G.wood1),e.hline(2,29,7,G.wood3),e.rect(4,10,2,5,G.woodDark),e.rect(26,10,2,5,G.woodDark),e.rect(4,5,2,2,G.woodDark),e.rect(26,5,2,2,G.woodDark),e.outline()}function Kl(){let e=new q(18,20);return e.rect(8,10,2,9,G.woodDark),e.rect(1,2,16,9,G.wood3),e.hline(1,16,10,G.wood1),e.hline(3,12,4,G.woodDark),e.hline(3,14,6,G.woodDark),e.hline(3,9,8,G.woodDark),e.outline()}function ql(){let e=new q(32,36);for(let t=0;t<7;t++)e.hline(9-t,22+t,1+t,t%2?G.roofRed1:G.roofRed2);e.hline(2,29,8,G.roofRed2),e.rect(5,9,2,14,G.wood2),e.rect(25,9,2,14,G.wood2),e.hline(7,24,11,G.woodDark),e.vline(16,12,17,`#d8c08a`),e.rect(15,18,3,3,G.wood1),e.ellipse(2,20,28,15,G.cobble2),e.rect(2,24,28,7,G.cobble2),e.ellipse(5,21,22,7,`#2f4c5e`);for(let t=3;t<30;t+=5)e.rect(t,26,4,2,G.cobble1),e.rect(t+2,29,4,2,G.cobble3);return e.outline()}function Jl(){let e=new q(34,36);for(let t=1;t<33;t++){let n=Math.floor((t-1)/4)%2?G.white:`#c9483f`;e.vline(t,2,8,n),t%4==2&&e.set(t,9,n)}e.hline(1,32,2,J(`#c9483f`,G.outline,.2)),e.rect(3,9,2,15,G.wood2),e.rect(29,9,2,15,G.wood2),e.rect(1,22,32,12,G.wood1),e.hline(1,32,22,G.wood3);for(let t=3;t<32;t+=6)e.vline(t,24,33,G.wood2);return[G.flowerRed,`#e0823a`,G.leaf2,G.flowerYellow].forEach((t,n)=>{let r=4+n*7;e.rect(r,18,6,4,G.wood3),e.ellipse(r,15,6,5,t),e.set(r+2,16,J(t,G.white,.5))}),[9,15,21].forEach((t,n)=>{e.rect(t,11,3,4,G.paper),e.set(t+1,12,[G.flowerPink,G.leaf2,G.flowerYellow][n])}),e.outline()}function Yl(){let e=new q(12,20);return e.rect(5,9,2,10,G.woodDark),e.rect(1,2,10,8,`#4b7fcf`),e.hline(2,9,1,`#4b7fcf`),e.hline(1,10,9,`#3a64a6`),e.rect(3,4,6,1,`#3a64a6`),e.rect(10,3,1,4,`#c9483f`),e.outline()}function Xl(e){let t=new q(16,14);return e===1?(t.rect(7,2,3,11,G.wood3),t.vline(9,2,12,G.wood1),t.outline()):(t.rect(1,2,3,11,G.wood3),t.rect(12,2,3,11,G.wood3),t.rect(0,5,16,2,G.wood1),t.rect(0,9,16,2,G.wood1),t.hline(0,15,5,G.wood3),t.outline())}function Zl(e){if(e>=4)return Ql(e);let t=new q(16,e===3?24:16);if(e===0)t.ellipse(3,7,10,8,G.leaf2),t.ellipse(5,6,6,6,G.leaf3),t.set(7,9,G.leaf1);else if(e===1){for(let e of[5,7,9])t.vline(e,5,12,G.leaf2),t.set(e-1,6,G.leaf3),t.set(e+1,8,G.leaf3);t.hline(5,9,13,`#e0823a`)}else if(e===2){t.vline(8,1,14,G.wood2);for(let e=3;e<14;e+=2)t.set(7+(e%4?1:-1),e,G.leaf2),t.set(9,e+1,G.leaf3)}else for(let e of[4,8,11])t.vline(e,4,22,G.leaf1),t.set(e-1,8,G.leaf2),t.set(e+1,12,G.leaf2),t.set(e-1,16,G.leaf2),t.set(e,3,G.flowerYellow);return t.outline()}function Ql(e){let t=new q(16,20);if(e===4){for(let e of[4,11])t.vline(e,11,19,`#8a8a4a`),t.set(e-1,14,`#c9c46a`),t.set(e+1,13,`#b8b060`),t.set(e+1,16,`#c9c46a`);t.rect(10,10,2,2,G.white)}else if(e===5)t.ellipse(1,11,14,8,G.leaf2),t.ellipse(3,10,5,4,G.leaf3),t.ellipse(9,11,5,4,G.leaf3),t.set(6,15,G.leaf1),t.set(11,16,G.leaf1),t.rect(4,16,3,1,`#c9d36a`);else if(e===7){t.hline(1,14,18,`#7a4a7a`);for(let[e,n]of[[2,13],[7,11],[11,14]])t.ellipse(e,n,5,5,G.leaf2),t.set(e+2,n+1,G.leaf3);t.rect(5,17,4,2,`#c8643a`)}else for(let e of[4,8,12])t.vline(e,5,19,G.leaf1),t.set(e-1,9,G.leaf2),t.set(e+1,12,G.leaf2),t.set(e-1,15,G.leaf3),t.rect(e-1,3+e%3,3,2,G.white);return t.outline()}function $l(){let e=new q(18,30);return e.vline(9,10,28,G.woodDark),e.hline(2,15,12,G.woodDark),e.ellipse(5,2,8,8,`#e8d49a`),e.set(7,5,G.outline),e.set(10,5,G.outline),e.hline(3,14,2,`#8a5a3a`),e.rect(5,0,8,2,`#8a5a3a`),e.rect(5,11,8,9,`#4b7fcf`),e.set(3,13,`#e8d49a`),e.set(14,13,`#e8d49a`),e.outline()}function eu(){let e=new q(16,16);return e.rect(1,3,14,12,G.wood1),e.rect(1,3,14,2,G.wood3),e.vline(4,5,14,G.wood2),e.vline(11,5,14,G.wood2),e.ellipse(3,0,5,4,G.flowerRed),e.ellipse(8,1,5,4,G.leaf2),e.outline()}function tu(){let e=new q(14,18);return e.ellipse(1,1,12,16,G.wood1),e.hline(2,11,4,G.metal),e.hline(2,11,13,G.metal),e.vline(4,2,16,G.wood3),e.outline()}function nu(){let e=new q(16,18);return[3,7,11].forEach((t,n)=>{e.rect(t,6+n%2*2,2,11-n%2*2,G.leaf2),e.vline(t,6+n%2*2,16,G.leaf1),n!==1&&e.rect(t,3+n,2,3,G.trunk)}),e.set(6,10,G.leaf3),e.set(10,12,G.leaf3),e.outline(G.grassDeep)}function ru(){let e=new q(24,22);return e.rect(2,10,20,3,G.wood3),e.hline(2,21,10,`#d99a62`),e.rect(3,13,2,8,G.wood2),e.rect(19,13,2,8,G.wood2),e.hline(4,19,17,G.wood2),[4,11].forEach(t=>{e.rect(t,6,5,4,`#b8634a`),e.hline(t-1,t+5,6,`#d0775b`),e.vline(t+2,2,5,G.leaf1),e.set(t+1,3,G.leaf3),e.set(t+3,2,G.leaf3)}),e.rect(17,7,5,3,G.paper),e.hline(17,21,7,`#4f9a4a`),e.outline()}function iu(e,t=0){switch(e){case`potting`:return ru();case`tree`:return Vl(t);case`pine`:return Hl(t);case`bush`:return Ul(t);case`lamp`:return Wl();case`bench`:return Gl();case`sign`:return Kl();case`well`:return ql();case`stall`:return Jl();case`mailbox`:return Yl();case`fence`:return Xl(t);case`crop`:return Zl(t);case`scarecrow`:return $l();case`crate`:return eu();case`barrel`:return tu();case`reeds`:return nu()}}var au={cottage:{base:G.plaster,shade:G.plaster2,trim:G.wood2},greenhouse:{base:G.glass1,shade:G.glass2,trim:G.glassFrame},shop:{base:`#e7c9a0`,shade:`#d4b388`,trim:G.wood2},school:{base:G.brick1,shade:G.brick2,trim:G.white},workshop:{base:G.wood1,shade:G.wood2,trim:G.woodDark}},ou={red:[G.roofRed1,G.roofRed2],blue:[G.roofBlue1,G.roofBlue2],green:[G.roofGreen1,G.roofGreen2],brown:[G.roofBrown1,G.roofBrown2],glass:[G.glass1,G.glass2]};function su(e){let t=e.w*16,n=Math.round(e.h*16),r=new q(t,n),i=new q(t,n),a=au[e.style];if(r.rect(0,0,t,n,a.base),e.style===`school`)for(let e=0;e<n;e+=4)for(let n=e/4%2?0:4;n<t;n+=8)r.hline(n,n+6,e+3,a.shade),r.set(n+7,e+1,a.shade);else if(e.style===`workshop`||e.style===`cottage`||e.style===`shop`){let i=e.style===`workshop`?4:8;for(let e=i-1;e<n;e+=i)r.hline(0,t-1,e,a.shade)}if(e.style===`greenhouse`){for(let e=0;e<t;e+=8)r.vline(e,0,n-1,a.trim);r.hline(0,t-1,Math.floor(n/2),a.trim);for(let e=2;e<t-2;e+=5){let t=5+Math.floor(mc(e,1,3)*8);for(let i=n-3;i>n-3-t;i--)r.set(e,i,i%3?G.leaf2:G.leaf1);r.set(e-1,n-3-t+2,G.leaf3),r.set(e+1,n-3-t+3,G.leaf3),e%3==0&&r.set(e,n-3-t,G.flowerRed)}r.rect(0,n-3,t,3,G.cobble2)}r.vline(0,0,n-1,a.trim),r.vline(t-1,0,n-1,a.trim),e.style!==`greenhouse`&&r.rect(0,n-3,t,3,J(a.shade,G.outline,.25));let o=(e.doorX-e.x)*16+3,s=Math.min(n-3,22),c=e.style===`greenhouse`?G.glassFrame:e.style===`school`?G.roofBlue2:G.woodDark;if(r.rect(o-1,n-s-1,12,s+1,a.trim),r.rect(o,n-s,10,s,c),e.style===`greenhouse`?r.rect(o+1,n-s+1,8,s-2,G.glass2):(r.rect(o+2,n-s+2,6,6,J(c,G.white,.15)),r.set(o+8,n-Math.floor(s/2),G.gold)),e.style!==`greenhouse`)for(let t=0;t<e.w;t++){if(t+e.x===e.doorX||t===0||t===e.w-1||(t+e.x)%2==0&&e.w>4)continue;let o=t*16+3,s=Math.max(4,n-26);r.rect(o-1,s-1,12,11,a.trim),r.rect(o,s,10,9,G.windowDark),r.hline(o,o+9,s+4,a.trim),r.vline(o+5,s,s+8,a.trim),r.set(o+1,s+1,G.glass1),r.set(o+6,s+1,G.glass1),(e.style===`cottage`||e.style===`shop`)&&(r.hline(o-2,o+11,s+10,a.trim),[o,o+3,o+7].forEach((e,t)=>r.set(e,s+9,[G.flowerRed,G.flowerYellow,G.flowerPink][t]))),i.rect(o,s,10,9,G.windowLit),i.hline(o,o+9,s+4,J(G.windowLit,a.trim,.6)),i.vline(o+5,s,s+8,J(G.windowLit,a.trim,.6))}if(e.style===`shop`||e.style===`school`||e.style===`workshop`){let n=Math.floor(t/2)-14;r.rect(n,2,28,7,e.style===`school`?G.white:G.wood3),r.hline(n+3,n+24,5,G.woodDark),e.style===`school`&&r.set(n+13,1,G.gold)}let l=t+8,u=e.d*16+4,d=new q(l,u),[f,p]=ou[e.roof];if(e.roof===`glass`){d.rect(0,0,l,u,G.glass1);for(let e=0;e<l;e+=8)d.vline(e,0,u-1,G.glassFrame);for(let e=0;e<u;e+=10)d.hline(0,l-1,e,G.glassFrame);for(let e=0;e<l;e+=3)d.set(e,e*7%u,G.white);d.hline(0,l-1,u-1,G.glassFrame),d.hline(0,l-1,0,G.glassFrame)}else{d.rect(0,0,l,u,f);for(let e=2;e<u;e+=4){d.hline(0,l-1,e,p);for(let t=e/4%2?2:6;t<l;t+=8)d.vline(t,e-3,e,p)}if(d.hline(0,l-1,0,J(f,G.white,.3)),d.hline(0,l-1,u-1,J(p,G.outline,.4)),d.hline(0,l-1,u-2,J(p,G.outline,.2)),e.style===`cottage`&&(d.rect(l-22,0,8,10,G.brick1),d.hline(l-23,l-13,0,G.brick2),d.hline(l-22,l-15,5,G.brick2)),e.style===`school`){let e=Math.floor(l/2);d.rect(e-5,0,10,9,G.white),d.rect(e-3,2,6,5,G.outline),d.rect(e-1,3,2,3,G.gold)}}return{wall:r.toCanvas(),lit:i.toCanvas(),roof:d.outline(J(p,G.outline,.5)).toCanvas()}}function cu(e){switch(e){case`bed`:{let e=new q(32,30);e.rect(1,1,30,8,G.wood2),e.rect(3,3,26,4,G.wood3),e.rect(2,8,28,20,G.white),e.rect(5,9,22,5,`#f3eadb`),e.rect(2,15,28,13,`#4b7fcf`);for(let t=4;t<30;t+=6)for(let n=17;n<28;n+=5)e.rect(t,n,3,2,`#e8bd3f`);return e.hline(2,29,15,`#6e9be0`),e.rect(1,27,30,2,G.wood2),e.outline()}case`wardrobe`:{let e=new q(18,32);return e.rect(1,1,16,30,G.wood1),e.hline(1,16,1,G.wood3),e.vline(9,3,28,G.woodDark),e.rect(3,4,5,22,G.wood3),e.rect(10,4,5,22,G.wood3),e.set(7,16,G.gold),e.set(11,16,G.gold),e.outline()}case`shelf`:{let e=new q(18,26);return e.rect(1,1,16,24,G.wood2),e.rect(2,2,14,22,G.woodDark),[8,15,22].forEach(t=>e.hline(2,15,t,G.wood3)),e.rect(3,4,2,4,`#c9483f`),e.rect(5,5,2,3,`#4b7fcf`),e.rect(7,4,2,4,`#e8bd3f`),e.outline()}case`desk`:{let e=new q(32,22);return e.rect(1,6,30,4,G.wood3),e.rect(2,10,3,11,G.wood2),e.rect(27,10,3,11,G.wood2),e.rect(19,10,8,7,G.wood1),e.set(22,13,G.gold),e.rect(4,2,9,4,G.paper),e.vline(8,2,5,G.paper2),e.rect(24,1,2,5,G.flowerYellow),e.rect(23,4,4,2,G.flowerRed),e.outline()}case`plantstand`:{let e=new q(14,22);return e.rect(3,12,8,8,`#b8634a`),e.hline(2,11,12,`#d0775b`),e.ellipse(1,1,12,12,G.leaf2),e.ellipse(3,2,6,6,G.leaf3),e.outline()}case`pot`:{let e=new q(12,12);return e.rect(2,5,8,6,`#b8634a`),e.hline(1,10,5,`#d0775b`),e.hline(3,8,6,G.soil2),e.outline()}case`window`:{let e=new q(28,22);return e.rect(0,0,28,20,G.wood2),e.rect(2,2,24,16,`#9fd3ee`),e.ellipse(4,11,10,8,`#7cb356`),e.ellipse(12,12,14,8,`#6aa24a`),e.rect(5,4,5,2,G.white),e.vline(13,2,17,G.wood2),e.hline(2,25,9,G.wood2),e.rect(0,19,28,3,G.wood3),e}case`lampdesk`:{let e=new q(10,12);return e.rect(3,1,5,4,G.flowerYellow),e.vline(5,5,10,G.metal),e.hline(3,7,10,G.metal),e.outline()}}}function lu(e,t=0){if(e===`desk`){let e=new q(32,22);return e.rect(1,4,30,4,G.wood3),e.hline(1,30,4,`#d99a62`),e.rect(2,8,2,12,G.wood2),e.rect(28,8,2,12,G.wood2),e.rect(3,14,26,3,G.wood1),e.rect(6,1,7,3,G.paper),e.vline(9,1,3,G.paper2),e.rect(20,2,5,2,`#3a3a44`),e.outline()}if(e===`globe`){let e=new q(14,22);return e.ellipse(1,1,12,12,G.water1),e.ellipse(3,3,5,4,G.leaf2),e.ellipse(7,7,4,3,G.leaf2),e.vline(7,13,19,G.metal),e.hline(3,11,20,G.wood2),e.outline()}let n=new q(20,32),r=[`#9fd3ee`,`#f6d9a8`,`#cfe6c4`,`#e6ddf5`,`#fbe3c0`,`#bfe3c8`];return n.vline(4,10,30,G.wood2),n.vline(15,10,30,G.wood2),n.vline(10,12,30,G.woodDark),n.rect(1,2,18,15,G.wood1),n.rect(3,4,14,11,r[t%r.length]),n.rect(3,11,14,4,G.grass1),n.ellipse(10,5,4,4,G.gold),n.rect(6,9,3,4,G.trunk),n.ellipse(4,6,7,5,G.leaf2),n.hline(2,17,18,G.wood3),n.outline()}function uu(){let e=new q(12,16);return e.rect(2,9,8,6,`#b8634a`),e.hline(1,10,9,`#d0775b`),e.hline(3,8,10,G.soil2),e.set(6,8,G.soil3),e.set(5,7,G.soil3),e.outline()}function du(e){let t=new ti(e);return t.magFilter=r,t.minFilter=r,t.generateMipmaps=!1,t.colorSpace=Fe,t.needsUpdate=!0,t}var fu=class{constructor(){K(this,`tinted`,new Set),K(this,`nightGlow`,new Set),K(this,`tint`,new H(1,1,1)),K(this,`night`,0)}add(e){return this.tinted.add(e),e.color.copy(this.tint),e}addGlow(e,t=1){this.nightGlow.add({mat:e,max:t}),e.opacity=this.night*t,e.visible=this.night>.02}set(e,t){this.tint.setRGB(e[0],e[1],e[2],Fe),this.tinted.forEach(e=>e.color.copy(this.tint)),this.night=t,this.nightGlow.forEach(({mat:e,max:n})=>{e.opacity=t*n,e.visible=t>.02})}};function pu(e,t,n,r,i={}){let a=t.width/16,o=t.height/16*Z,s=new ii(a,o);s.translate(0,o/2,0);let c=new xr(s,e.add(new Jn({map:du(t),alphaTest:.5})));return c.position.set(n,(i.lift??0)*Z,r*Z),i.name&&(c.name=i.name),c}function mu(e,t){let n=document.createElement(`canvas`);n.width=e,n.height=e;let r=n.getContext(`2d`),i=e/2,a=[[.3,.85],[.55,.5],[.8,.26],[1,.1]];r.fillStyle=t;for(let t=0;t<e;t++)for(let n=0;n<e;n++){let e=Math.hypot(n+.5-i,t+.5-i)/i,o=a.find(([t])=>e<=t);o&&(r.globalAlpha=o[1],r.fillRect(n,t,1,1))}return r.globalAlpha=1,n}function hu(e,t,n,r,i,a,o=.8){let s=mu(t,n),c=new ii(t/16,t/16),l=new Jn({map:du(s),transparent:!0,blending:2,depthWrite:!1});e.addGlow(l,o);let u=new xr(c,l);return u.rotation.x=-Math.PI/4,u.position.set(r,a*Z,i*Z+.02),u.renderOrder=5,u}function gu(e,t,n,r,i,a=.35){let o=mu(Math.round(r*2*16),i),s=new ii(r*2,r*2*Z);s.rotateX(-Math.PI/2);let c=new Jn({map:du(o),transparent:!0,blending:2,depthWrite:!1});e.addGlow(c,a);let l=new xr(s,c);return l.position.set(t,.02,n*Z),l.renderOrder=1,l}var _u=null;function vu(e){if(!_u){let e=document.createElement(`canvas`);e.width=16,e.height=8;let t=e.getContext(`2d`);t.fillStyle=`rgba(30, 20, 30, 0.3)`,t.fillRect(3,1,10,6),t.fillRect(1,2,14,4),_u=du(e)}let t=new ii(e,e/2*Z);t.rotateX(-Math.PI/2);let n=new xr(t,new Jn({map:_u,transparent:!0,depthWrite:!1}));return n.renderOrder=2,n}function yu(e,t){let n=new Ur;n.name=`building:${t.id}`;let r=su(t),i=t.w,a=t.h*Z,o=(t.y+t.d)*Z,s=new ii(i,a);s.translate(0,a/2,0);let c=new xr(s,e.add(new Jn({map:du(r.wall)})));c.position.set(t.x+t.w/2,0,o),n.add(c);let l=new Jn({map:du(r.lit),transparent:!0,depthWrite:!1});e.addGlow(l,1);let u=new xr(s,l);u.position.set(t.x+t.w/2,0,o+.01),u.renderOrder=3,n.add(u);let d=r.roof.width/16,f=r.roof.height/16,p=new xr(new ii(d,f),e.add(new Jn({map:du(r.roof),alphaTest:.5})));p.rotation.x=-Math.PI/4;let m=new z(t.x+t.w/2,a,o+.12),h=new z(0,Math.SQRT1_2,-Math.SQRT1_2);return p.position.copy(m).addScaledVector(h,f/2),n.add(p),n}var bu=class{constructor(e,t,n,r,i=`down`){K(this,`group`,new Ur),K(this,`mesh`,void 0),K(this,`tex`,void 0),K(this,`mat`,void 0),K(this,`marker`,null),K(this,`markerKind`,null),K(this,`x`,void 0),K(this,`y`,void 0),K(this,`facing`,void 0),K(this,`moving`,!1),K(this,`anim`,0),K(this,`idleT`,Math.random()*10),K(this,`stepCallback`,null),K(this,`lastFrame`,0),K(this,`markerBase`,0),this.x=n,this.y=r,this.facing=i,this.mat=e.add(new Jn({alphaTest:.5}));let a=vu(.9);a.position.y=.015,this.group.add(a),this.setLook(t),this.sync()}setLook(e){let t=dc(e);this.tex?.dispose(),this.tex=du(t),this.tex.repeat.set(1/3,1/Qs.length),this.mat.map=this.tex,this.mat.needsUpdate=!0;let n=fc(e)/16*Z;this.mesh&&(this.group.remove(this.mesh),this.mesh.geometry.dispose());let r=new ii(1,n);r.translate(0,n/2,0),this.mesh=new xr(r,this.mat),this.group.add(this.mesh),this.setFrame(0)}get material(){return this.mat}onStep(e){this.stepCallback=e}setFrame(e){let t=Qs.indexOf(this.facing);this.tex.offset.set(e/3,1-(t+1)/Qs.length)}update(e,t){if(this.moving){this.anim+=e*8;let t=[1,0,2,0][Math.floor(this.anim)%4];t!==0&&t!==this.lastFrame&&this.stepCallback?.(),this.lastFrame=t,this.setFrame(t),this.mesh.position.y=0}else this.anim=0,this.lastFrame=0,this.setFrame(0),this.idleT+=e,this.mesh.position.y=!t&&Math.sin(this.idleT*2.2)>.6?Z/16:0;if(this.marker){let e=t?0:Math.round(Math.sin(this.idleT*3)*1.5)/16;this.marker.position.y=this.markerBase+e*Z}this.sync()}setMarker(e){if(e===this.markerKind||(this.markerKind=e,this.marker&&(this.group.remove(this.marker),this.marker=null),!e))return;let t=xu(e).toCanvas(),n=new ii(t.width/16,t.height/16),r=new Jn({map:du(t),transparent:!0,depthTest:!1});this.marker=new xr(n,r),this.marker.rotation.x=-Math.PI/4,this.marker.renderOrder=20;let i=new Tt().setFromObject(this.mesh);this.markerBase=i.max.y+.55,this.marker.position.set(0,this.markerBase,-.3),this.group.add(this.marker)}get marked(){return this.markerKind}headPoint(){let e=new Tt().setFromObject(this.mesh);return new z(this.group.position.x,e.max.y+.2,this.group.position.z)}sync(){let e=Math.round(this.x*16)/16,t=Math.round(this.y*16)/16;this.group.position.set(e,0,t*Z)}setVisible(e){this.group.visible=e}};function xu(e){let t=new q(13,17);t.ellipse(0,0,13,13,G.gold),t.ellipse(1,1,10,10,`#ffd35e`),t.rect(5,12,3,2,G.gold),t.set(6,14,G.gold);let n=G.outline;e===`turnin`?(t.hline(4,8,2,n),t.rect(8,3,2,3,n),t.rect(6,6,2,2,n),t.rect(6,9,2,2,n),t.rect(3,3,2,1,n)):(t.rect(5,2,3,6,n),t.rect(5,9,3,2,n));let r=new q(15,19);return r.blit(t,1,1),r.outline()}function Su(e){if(e.solid===!1)return[];switch(e.kind){case`well`:return[[0,0],[1,0],[0,1],[1,1]];case`stall`:case`bench`:return[[0,0],[1,0]];case`crop`:case`reeds`:return[];default:return[[0,0]]}}var Cu=class{constructor(e){K(this,`w`,void 0),K(this,`h`,void 0),K(this,`solid`,void 0),K(this,`dynamic`,new Set),K(this,`circles`,new Map),this.w=e.w,this.h=e.h,this.solid=new Uint8Array(e.w*e.h);for(let t=0;t<e.h;t++)for(let n=0;n<e.w;n++){let r=e.ground[t][n];(r===`water`||r===`wall`)&&(this.solid[t*e.w+n]=1)}for(let t of e.buildings)for(let e=t.y;e<t.y+t.d;e++)for(let n=t.x;n<t.x+t.w;n++)this.mark(n,e);for(let t of e.props)for(let[e,n]of Su(t))this.mark(t.x+e,t.y+n);e.blocked.forEach(e=>{let[t,n]=e.split(`,`).map(Number);this.mark(t,n)})}mark(e,t){e>=0&&t>=0&&e<this.w&&t<this.h&&(this.solid[t*this.w+e]=1)}setDynamic(e,t){t.forEach(([e,t])=>this.dynamic.add(`${e},${t}`))}clearDynamic(){this.dynamic.clear(),this.circles.clear()}setBlocker(e,t,n,r){this.circles.set(e,{x:t,y:n,r})}inCircle(e,t,n){for(let r of this.circles.values())if(Math.hypot(e-r.x,t-r.y)<r.r+n)return!0;return!1}isSolid(e,t){return this.isWall(e,t)||this.dynamic.has(`${e},${t}`)}isWall(e,t){return e<0||t<0||e>=this.w||t>=this.h||this.solid[t*this.w+e]===1}isFree(e,t,n){let r=Math.floor(e-n),i=Math.floor(e+n),a=Math.floor(t-n),o=Math.floor(t+n);for(let e=a;e<=o;e++)for(let t=r;t<=i;t++)if(this.isWall(t,e))return!1;return!this.inCircle(e,t,n)}move(e,t,n,r,i){let a=(e,t)=>{let n=Math.floor(e-i),r=Math.floor(e+i),a=Math.floor(t-i),o=Math.floor(t+i);for(let e=a;e<=o;e++)for(let t=n;t<=r;t++)if(this.isWall(t,e))return!1;return!0},o=e,s=t;n!==0&&a(e+n,t)&&(o=e+n),r!==0&&a(o,t+r)&&(s=t+r);for(let c of this.circles.values()){let l=o-c.x,u=s-c.y,d=Math.hypot(l,u),f=c.r+i;if(d<f){let i=d>1e-6?f/d:1,p=c.x+(d>1e-6?l*i:0),m=c.y+(d>1e-6?u*i:f);o=p,s=m;let h=Math.hypot(n,r);if(Math.hypot(o-e,s-t)<h*.3&&d>1e-6){let e=l/d,t=u/d,r=-t,i=e;(i<0||i===0&&r*n<0)&&(r=-r,i=-i);let a=c.x+(e+r*.35*(h/f))*f,p=c.y+(t+i*.35*(h/f))*f,m=Math.hypot(a-c.x,p-c.y);o=c.x+(a-c.x)/m*f,s=c.y+(p-c.y)/m*f}a(o,s)||(o=e,s=t)}}return{x:o,y:s}}};function wu(e,t,n,r={}){let i=Math.floor(t.x),a=Math.floor(t.y),o=Math.floor(n.x),s=Math.floor(n.y);if(e.isSolid(o,s)&&!r.allowGoalSolid){let t=Eu(e,o,s,i,a);if(!t)return null;[o,s]=t}let c=e.w,l=(e,t)=>t*c+e,u=[l(i,a)],d=new Map([[l(i,a),0]]),f=new Map([[l(i,a),Tu(i,a,o,s)]]),p=new Map,m=new Set,h=r.maxNodes??4e3,g=0;for(;u.length&&g++<h;){let t=0;for(let e=1;e<u.length;e++)(f.get(u[e])??1e9)<(f.get(u[t])??1e9)&&(t=e);let n=u.splice(t,1)[0],h=n%c,g=Math.floor(n/c);if(h===o&&g===s){let e=[],t=n;for(;t!==void 0&&t!==l(i,a);)e.unshift({x:t%c+.5,y:Math.floor(t/c)+.5}),t=p.get(t);return e}m.add(n);for(let t=-1;t<=1;t++)for(let i=-1;i<=1;i++){if(!i&&!t)continue;let a=h+i,c=g+t,_=a===o&&c===s;if(e.isSolid(a,c)&&!(_&&r.allowGoalSolid)||i&&t&&(e.isSolid(h+i,g)||e.isSolid(h,g+t)))continue;let v=l(a,c);if(m.has(v))continue;let y=(d.get(n)??1e9)+(i&&t?1.414:1);y<(d.get(v)??1e9)&&(p.set(v,n),d.set(v,y),f.set(v,y+Tu(a,c,o,s)),u.includes(v)||u.push(v))}}return null}function Tu(e,t,n,r){let i=Math.abs(e-n),a=Math.abs(t-r);return i+a-.586*Math.min(i,a)}function Eu(e,t,n,r,i){let a=null,o=1/0;for(let s=1;s<=2&&!a;s++)for(let c=-s;c<=s;c++)for(let l=-s;l<=s;l++){let s=t+l,u=n+c;if(e.isSolid(s,u))continue;let d=Math.hypot(s-r,u-i)+Math.abs(l)*.1+(c<0?.5:0);d<o&&(o=d,a=[s,u])}return a}var Du={build:`kid`,skin:{base:`#6e4329`,shade:`#573320`},hair:{style:`short`,base:`#2a1f1d`,shade:`#1a1312`,light:`#433331`},shirt:{base:`#b89a68`,shade:`#9a7f52`},pants:`#5a4a3a`,shoes:`#3a2a22`,accessory:`none`,accent:G.flowerYellow},Ou={build:`adult`,skin:{base:`#c08a5c`,shade:`#a47049`},hair:{style:`wrap`,base:`#4a2f22`,shade:`#352016`,light:`#664335`},shirt:{base:`#8a5cc4`,shade:`#6d469e`},pants:`#4a4038`,shoes:`#2f2521`,accessory:`none`,accent:`#dc6f9c`};function ku(e,t,n,r){for(let i=0;i<r;i++)e.hline(0,95,i,J(t,n,i/Math.max(1,r-1)))}function Au(e,t,n){e.rect(0,t,96,64-t,G.grass1);for(let r=0;r<90;r++){let i=Math.floor(mc(r,1,n)*96),a=t+Math.floor(mc(r,2,n)*(64-t));e.set(i,a,r%3?G.grass2:G.grass3)}}function ju(e,t,n,r){for(let i=0;i<96;i++){let a=Math.round(4+Math.sin(i/11+r)*3+Math.sin(i/5+r*2)*1.5);e.vline(i,t-a,t,n)}}function Mu(e,t,n,r){e.vline(t,n+1,n+4,G.leaf1),e.set(t-1,n,r),e.set(t+1,n,r),e.set(t,n-1,r),e.set(t,n+1,r),e.set(t,n,G.flowerYellow)}function Nu(e,t,n,r){e.blit(t,n,r)}function Pu(){let e=new q(96,64);ku(e,`#9fd3ee`,`#f6e2b8`,30),ju(e,30,`#7fae66`,1),Au(e,30,3),e.rect(8,22,30,18,`#8a5a3a`);for(let t=23;t<40;t+=3)e.hline(8,37,t,`#6e472e`);for(let t=0;t<9;t++)e.hline(6+t,39-t,21-t,t%2?`#6e472e`:`#5c3822`);e.rect(19,30,7,10,`#3a2a22`),e.rect(11,26,5,5,G.windowDark),e.rect(30,26,5,5,G.windowDark),e.rect(32,8,4,9,G.cobble2);for(let t=44;t<96;t+=10)e.rect(t,34,2,9,G.wood2);e.hline(42,95,36,G.wood1),e.hline(42,95,40,G.wood1);for(let t=50;t<92;t+=6)for(let n=48;n<60;n+=5)e.rect(t,n,3,2,G.leaf2);return e.rect(46,46,48,1,G.soil2),Nu(e,nc(Du,`right`,0),40,38),Mu(e,60,44,G.flowerRed),e}function Fu(){let e=new q(96,64);ku(e,`#bfe3c8`,`#e8f2d8`,20);for(let t=0;t<6;t++){let n=iu(`tree`,t%3);e.blit(n,-8+t*18,-6+t%2*4)}Au(e,36,7);for(let t=0;t<30;t++){let n=Math.floor(mc(t,5,2)*96),r=38+Math.floor(mc(t,6,2)*24);e.set(n,r,t%2?`#c98c4a`:`#a4553d`)}return e.ellipse(66,50,12,7,G.cobble2),e.ellipse(68,50,6,3,G.cobble3),[[30,50,G.flowerPurple],[36,54,G.flowerWhite],[44,48,G.flowerPink]].forEach(([t,n,r])=>Mu(e,t,n,r)),e.rect(52,30,2,2,G.flowerYellow),e.rect(55,30,2,2,G.flowerYellow),e.set(54,31,G.outline),Nu(e,nc(Du,`right`,0),14,34),e}function Iu(){let e=new q(96,64);ku(e,`#a8dcf0`,`#fbeec8`,26),ju(e,26,`#8cc463`,4),Au(e,26,9),e.rect(8,44,46,12,G.soil1);for(let t=10;t<52;t+=4)e.hline(8,53,47+t/4%2,G.soil2);for(let t=12;t<52;t+=8)e.vline(t,36,45,G.leaf1),e.ellipse(t-3,34,7,5,G.leaf2),e.set(t,33,G.flowerRed);return Nu(e,nc(Ou,`left`,0),70,30),e.rect(64,44,6,5,`#b8634a`),e.vline(66,38,43,`#9a9a52`),e.hline(62,66,38,`#b5a95a`),e.set(61,39,`#b5a95a`),Nu(e,nc(Du,`right`,0),50,34),e.rect(46,46,5,4,G.metalLight),e.hline(43,46,45,G.metalLight),[[42,47],[41,49],[42,51]].forEach(([t,n])=>e.set(t,n,G.water2)),e}function Lu(e,t,n,r=!1){let i=r?`#b08a62`:G.soil1;e.rect(0,t,96,64-t,i);for(let r=0;r<160;r++){let a=Math.floor(mc(r,3,n)*96),o=t+Math.floor(mc(r,4,n)*(64-t));e.set(a,o,r%2?J(i,G.outline,.25):J(i,G.white,.12))}}function Ru(e,t,n,r,i,a,o){e.ellipse(t,n,r,i,a),e.hline(t+2,t+r-3,n+Math.floor(i/2),o)}function zu(){let e=new q(96,64);return ku(e,`#cfe8c0`,`#e7f2d2`,50),Lu(e,50,1),e.rect(46,4,3,50,G.wood2),Ru(e,18,12,30,20,G.leaf2,G.leaf1),Ru(e,50,20,24,16,G.leaf3,G.leaf2),Ru(e,30,34,20,13,G.leaf2,G.leaf1),[[26,16],[34,20],[29,25]].forEach(([t,n])=>{e.ellipse(t,n,4,4,`#dcebc9`),e.set(t,n+1,`#8a7a4a`)}),e.hline(20,45,32,G.leaf4),e.rect(30,33,7,2,`#7ec850`),e.set(36,33,G.outline),e.set(31,35,`#5aa23a`),e.set(33,35,`#5aa23a`),e.rect(52,38,2,9,G.leaf1),e.rect(56,40,2,8,G.leaf1),e}function Bu(){let e=new q(96,64);return Lu(e,0,2),e.rect(70,0,10,40,G.wood3),e.vline(70,0,39,G.wood1),e.rect(60,30,36,34,J(G.soil1,G.outline,.25)),e.ellipse(18,30,44,22,`#4e3222`),e.ellipse(24,34,30,12,`#432b1d`),e.set(30,36,`#9ab8c8`),e.set(44,40,`#9ab8c8`),[[30,44],[31,43],[32,43],[33,44],[34,45],[35,45],[36,44],[37,43],[38,43],[39,44]].forEach(([t,n])=>{e.set(t,n-1,`#f0a0a0`),e.set(t,n,`#e08a8a`),e.set(t,n+1,`#c86a70`)}),[[8,10],[52,12],[12,54],[80,52]].forEach(([t,n])=>e.ellipse(t,n,5,3,G.cobble1)),e}function Vu(){let e=new q(96,64);Lu(e,0,3),e.ellipse(4,4,88,58,G.leaf3),e.ellipse(10,8,76,48,`#8fd06a`);for(let t=0;t<6;t++)e.hline(20+t*2,76-t*3,12+t*7,G.leaf2);return e.vline(48,8,58,G.leaf2),e.ellipse(26,24,16,13,`#d8403a`),e.ellipse(29,21,10,5,G.outline),e.vline(34,26,36,`#7a1e1a`),[[29,28],[38,28],[31,32],[37,32],[33,35],[28,34],[39,34]].forEach(([t,n])=>e.rect(t,n,2,2,G.outline)),e.set(31,26,`#ff9a8a`),[[60,30],[63,32],[66,30],[62,35],[67,34],[70,32]].forEach(([t,n])=>{e.rect(t,n,2,2,`#cfe8a0`),e.set(t+2,n+1,`#a8c878`)}),e}function Hu(){let e=new q(96,64);ku(e,`#d8eccb`,`#eef4de`,40),Lu(e,40,4,!0),[[10,48,22],[40,52,18],[66,46,20]].forEach(([t,n,r])=>{for(let i=0;i<r;i++)e.set(t+i,n+Math.round(Math.sin(i/2)*1.5),`#7d5f40`)});for(let t of[18,42,70]){for(let n=-8;n<=8;n+=2){let r=10+Math.abs(n);for(let i=r;i<40;i++)e.set(t+Math.round(n*(40-i)/30),i,G.leaf1);e.set(t+Math.round(n*(40-r)/30),r,n%4==0?`#d8c24a`:G.leaf3),e.set(t+Math.round(n*(40-r-1)/30),r+1,n%4==0?`#c9a83a`:G.leaf2)}e.rect(t-2,40,5,3,`#e0823a`)}return e}function Uu(){let e=new q(96,64);ku(e,`#bfe3f0`,`#e6f4f8`,64),e.vline(40,34,63,G.leaf1),e.ellipse(26,46,14,6,G.leaf2);for(let t=0;t<5;t++){let n=t/5*Math.PI*2-Math.PI/2;e.ellipse(Math.round(40+Math.cos(n)*11)-6,Math.round(26+Math.sin(n)*11)-6,13,13,G.flowerWhite)}return e.ellipse(34,20,13,13,G.flowerYellow),e.ellipse(37,23,6,6,`#e0a93a`),e.ellipse(56,16,18,11,`#f2c94c`),[60,64,68].forEach(t=>e.vline(t,17,25,G.outline)),e.ellipse(71,17,7,8,G.outline),e.ellipse(56,8,10,7,`#e8f4ff`),e.ellipse(62,7,9,6,`#dcecff`),e.rect(55,27,4,3,`#f0a020`),e.rect(62,28,4,3,`#f0a020`),e.vline(57,25,27,G.outline),e.vline(64,26,28,G.outline),e}function Wu(){let e=new q(96,64);Lu(e,0,6),e.rect(4,4,88,14,G.wood1),e.hline(4,91,17,G.wood2),e.rect(4,18,88,6,J(G.soil1,G.outline,.35));for(let t=10;t<46;t++)e.set(t,44+Math.round(Math.sin(t/4)),`#cfe3ea`);return e.ellipse(46,34,18,16,`#b8864a`),e.ellipse(50,38,10,9,`#9a6a36`),e.ellipse(53,41,4,4,`#b8864a`),e.rect(40,46,28,4,`#a89a8a`),e.vline(66,40,46,`#a89a8a`),e.vline(69,41,46,`#a89a8a`),e.set(66,39,G.outline),e.set(69,40,G.outline),e}function Gu(){let e=new q(96,64);return Au(e,0,11),e.rect(0,0,30,64,G.trunk),e.vline(10,0,63,J(G.trunk,G.outline,.3)),e.ellipse(22,44,30,16,G.trunk),[[40,30,16],[58,36,12],[72,28,18]].forEach(([t,n,r])=>{e.rect(t+r/2-2,n+6,5,12,`#f1e3c6`),e.ellipse(t,n,r,10,`#c9483f`),e.set(t+4,n+3,G.white),e.set(t+r-5,n+4,G.white),e.set(t+r/2,n+2,G.white)}),e}var Ku={...Du,build:`adult`,shirt:{base:`#c9b27a`,shade:`#a8925e`}},qu={...Du,build:`adult`,shirt:{base:`#f4efe4`,shade:`#d9d2c2`},pants:`#4a4038`,extras:{jacket:{base:`#5a4a6b`,shade:`#46394f`},tie:`#2f2521`,mustache:`#2a1f1d`}},Ju={build:`adult`,skin:{base:`#f0c9a4`,shade:`#d9ab86`},hair:{style:`bun`,base:`#7a4a2a`,shade:`#5d371e`,light:`#96603a`},shirt:{base:`#2f7a6a`,shade:`#235e51`},pants:`#3a3a44`,shoes:`#2f2521`,accessory:`none`,accent:G.flowerYellow};function Yu(e,t,n){e.rect(0,0,96,44,t),e.rect(0,44,96,20,n);for(let t=0;t<96;t+=8)e.vline(t,44,63,J(n,G.outline,.2));e.hline(0,95,44,J(t,G.outline,.3))}function Xu(){let e=new q(96,64);Yu(e,`#8a5a3a`,`#6e472e`);for(let t=4;t<44;t+=6)e.hline(0,95,t,`#7a4f33`);return e.rect(60,8,20,16,`#f2d38a`),e.vline(70,8,23,G.wood2),e.rect(10,34,30,4,G.wood3),e.rect(12,38,2,10,G.wood2),e.rect(36,38,2,10,G.wood2),e.rect(20,30,10,4,G.paper),e.vline(25,30,33,G.paper2),e.rect(32,26,3,8,`#e0a93a`),e.set(33,25,G.lampGlow),e.blit(nc(Du,`right`,0),44,30),e}function Zu(){let e=new q(96,64);ku(e,`#a8dcf0`,`#f6e2b8`,30),ju(e,30,`#8cc463`,2),Au(e,30,4);for(let t=36;t<64;t++)e.hline(40-Math.floor((t-36)/2),52+Math.floor((t-36)/2),t,G.path1);e.rect(62,14,26,18,G.plaster);for(let t=0;t<7;t++)e.hline(60+t,89-t,13-t,G.roofRed2);return e.rect(72,22,6,10,G.wood2),e.rect(73,2,3,4,G.gold),e.blit(nc(Du,`up`,1),38,40),e.rect(52,50,4,3,`#b89a68`),e}function Qu(){let e=new q(96,64);ku(e,`#bfe3f0`,`#f8ecc8`,34),Au(e,34,6);for(let t=0;t<96;t+=3)e.vline(t,30+t%2,34,`#d9c26a`);return e.rect(6,12,30,22,`#d8c4a0`),e.rect(6,10,30,3,G.wood2),e.rect(14,22,6,12,G.wood2),e.rect(24,18,8,6,G.windowDark),e.hline(50,92,24,G.ink),[54,62,70,80].forEach((t,n)=>e.rect(t,25,6,8,[G.white,`#9fd3ee`,G.flowerYellow,G.white][n])),e.rect(44,44,14,8,G.metalLight),e.hline(44,57,44,G.metal),e.blit(nc(Ku,`left`,0),58,32),e.rect(76,50,8,3,`#7a3f2c`),e.rect(76,47,8,3,`#3e5a88`),e}function $u(){let e=new q(96,64);ku(e,`#c8d4e0`,`#e8e4dc`,40),Au(e,40,8),e.rect(30,4,60,36,G.brick1);for(let t=6;t<40;t+=4)e.hline(30,89,t,G.brick2);return e.rect(54,22,12,18,`#4a3326`),e.vline(60,22,39,G.outline),[36,76].forEach(t=>e.rect(t,12,8,8,G.windowDark)),e.rect(50,40,20,3,G.cobble2),e.blit(nc(qu,`right`,0),20,34),e.rect(10,52,8,7,`#8a5a3a`),e.rect(12,50,4,2,G.outline),e.rect(32,44,5,4,G.paper),e}function ed(){let e=new q(96,64);return Yu(e,`#efe0bf`,`#a0643c`),e.rect(8,6,22,16,G.wood2),e.rect(10,8,18,12,`#9fd3ee`),e.rect(48,14,22,20,G.wood1),e.rect(50,16,18,16,G.paper),e.vline(59,22,31,G.leaf1),e.ellipse(54,17,10,8,`#dc6f9c`),e.ellipse(57,19,4,4,G.flowerYellow),e.vline(52,34,50,G.wood2),e.vline(66,34,50,G.wood2),e.blit(nc(qu,`right`,0),28,30),e.blit(nc(Ju,`left`,0),72,30),e.rect(80,50,10,6,`#b8634a`),e.ellipse(80,42,10,9,G.leaf2),e}function td(){let e=new q(96,64);ku(e,`#a8dcf0`,`#eaf6e8`,28),Au(e,28,10),e.rect(46,6,44,24,G.glass1);for(let t=46;t<90;t+=6)e.vline(t,6,29,G.glassFrame);e.hline(46,89,6,G.glassFrame);for(let t=48;t<88;t+=5)e.vline(t,22,28,G.leaf2);for(let t=4;t<40;t+=6)for(let n=40;n<62;n+=6)e.rect(t,n,3,3,G.leaf2);return e.blit(nc(qu,`down`,0),22,26),e.rect(38,36,6,8,G.paper),e.hline(38,43,40,`#c9483f`),e}function nd(){let e=new q(96,64);ku(e,`#9fd3ee`,`#fbeec8`,30),Au(e,30,12),e.rect(12,6,58,26,G.brick1);for(let t=8;t<32;t+=4)e.hline(12,69,t,G.brick2);for(let t of[18,32,46,60])e.rect(t,12,6,8,G.windowDark);e.rect(36,22,10,10,G.wood2);for(let t=0;t<6;t++)e.hline(10+t,71-t,5-t,G.roofRed2);return e.blit(nc({...qu,extras:{...qu.extras,lapelFlower:`#e0574f`}},`down`,0),74,34),e}function rd(){let e=new q(96,64);Lu(e,0,31,!0),e.rect(40,4,50,20,`#c7a57a`);let t=t=>t.forEach(([t,n])=>e.set(t,n,`#6e5236`));for(let e=0;e<12;e++)t([[46+e,8+e%3],[60+e%4,6+e],[70+e,14+e%2]]);for(let e=0;e<8;e++)t([[80+e%3,6+e*2],[52+e,18+e%2]]);for(let t=0;t<40;t++)e.set(4+Math.floor(mc(t,5,7)*30),4+Math.floor(mc(t,6,7)*22),`#e2cda4`);e.rect(0,30,96,34,`#a4815a`);for(let t=0;t<70;t++)e.set(Math.floor(mc(t,8,3)*96),30+Math.floor(mc(t,9,3)*34),`#8e6e4c`);for(let t=30;t<60;t++)e.set(52+Math.round(Math.sin(t/5)*2),t,`#e6dcc0`);return e.hline(0,95,29,`#8a6a48`),e}function id(){let e=new q(96,64);Lu(e,0,32),e.rect(0,0,96,30,`#5a3a26`);for(let t=0;t<26;t++){let n=Math.floor(mc(t,1,11)*90),r=Math.floor(mc(t,2,11)*26);e.ellipse(n,r,4,3,t%2?`#6e4a30`:`#432b1d`)}[[8,20],[30,6],[84,22]].forEach(([t,n])=>e.rect(t,n,3,2,`#8a7a3a`));for(let t=0;t<24;t++){let n=42+t,r=14+Math.round(Math.sin(t/3)*2);e.set(n,r-1,`#f0a0a0`),e.set(n,r,`#e08a8a`),e.set(n,r+1,`#c86a70`)}e.rect(0,30,96,34,`#4e3222`);for(let t=0;t<60;t++)e.set(Math.floor(mc(t,8,5)*96),30+Math.floor(mc(t,9,5)*34),`#65402a`);for(let t=0;t<=30;t++){let n=36+t,r=34+Math.round(t*.7);e.set(n,r,`#e6d2a8`),e.set(n,r+1,`#cdb88c`)}for(let t=0;t<12;t++)e.set(50+t,44-Math.round(t*.4),`#e6d2a8`);return[[42,38],[49,42],[56,45],[63,51],[55,38],[60,36]].forEach(([t,n])=>{e.ellipse(t,n,4,4,`#e6a98a`),e.set(t+1,n+1,`#fbd2b8`)}),e.hline(0,95,29,`#3a2418`),e}var ad={build:`adult`,skin:{base:`#5a3825`,shade:`#462a1b`},hair:{style:`short`,base:`#2a1f1d`,shade:`#1a1312`,light:`#433331`},shirt:{base:`#e7d9b8`,shade:`#cdbd98`},pants:`#3e5a88`,shoes:`#3a2a22`,accessory:`cap`,accent:`#8a6a48`};function od(){let e=new q(96,64);return ku(e,`#9fd3ee`,`#fbeec8`,22),ju(e,22,`#8fbf6a`,3),e.rect(0,22,96,42,`#b89468`),[[4,28,!1],[28,28,!0],[52,28,!1],[76,28,!0],[4,46,!0],[28,46,!1],[52,46,!0]].forEach(([t,n,r])=>{e.rect(t,n,18,12,r?`#5a3a26`:`#c7a57a`);for(let i=0;i<4;i++)e.rect(t+2+i*4,n+3,2,r?6:3,r?G.leaf2:`#b8b060`);e.vline(t,n-4,n+1,G.wood2),e.rect(t-1,n-6,5,3,G.paper)}),e.blit(nc({...qu,extras:{...qu.extras,lapelFlower:`#e0574f`}},`down`,0),76,40),e}function sd(){let e=new q(96,64);ku(e,`#a8dcf0`,`#f6eecb`,30),Au(e,30,14),e.rect(0,8,34,26,G.wood1);for(let t=10;t<34;t+=3)e.hline(0,33,t,G.wood2);e.rect(8,16,8,10,G.windowDark),e.blit(nc({...qu,extras:{...qu.extras,lapelFlower:`#e0574f`}},`right`,0),40,30),e.blit(nc(ad,`left`,0),60,30),e.rect(55,40,6,7,G.paper),e.hline(56,59,42,G.ink),e.hline(56,58,44,G.ink);for(let t=4;t<92;t+=8)e.rect(t,56,4,3,G.leaf2);return e}var cd={farm:Pu,woods:Fu,doctor:Iu,beans:zu,soil:Bu,ladybug:Vu,carrots:Hu,bee:Uu,snail:Wu,mushrooms:Gu,"ch2-reading":Xu,"ch2-neosho":Zu,"ch2-kansas":Qu,"ch2-highland":$u,"ch2-simpson":ed,"ch2-iowastate":td,"ch2-tuskegee":nd,"soil-west":rd,"soil-east":id,"mem-station":od,"mem-bulletin":sd},ld=new Map;function ud(e){let t=ld.get(e);return t||(t=(cd[e]??Pu)().toCanvas(),ld.set(e,t)),t}function dd(e,t){let n=Ac(t),r=new ii(t.w,t.h*Z);r.rotateX(-Math.PI/2);let i=new xr(r,e.add(new Jn({map:du(n)})));return i.position.set(t.w/2,0,t.h/2*Z),i.name=`ground`,i}function fd(e,t){let n=(e,n)=>t.props.some(t=>t.kind===`fence`&&t.x===e&&t.y===n);return n(e.x-1,e.y)||n(e.x+1,e.y)?0:1}var pd=new Map;function md(e,t){let n=`${e}:${t}`,r=pd.get(n);return r||(r=iu(e,t).toCanvas(),pd.set(n,r)),r}function hd(e,t,n){for(let r of n.props){let i=r.kind===`fence`?fd(r,n):r.variant??0,a=md(r.kind,i),o=Su({...r,solid:!0}),s=Math.max(1,...o.map(([e])=>e+1)),c=Math.max(1,...o.map(([,e])=>e+1)),l=r.x+s/2,u=r.y+c-(r.kind===`crop`?.25:.4),d=pu(t,a,l,u+mc(r.x,r.y,2)*.01,{name:`prop:${r.kind}`});e.add(d),r.kind===`lamp`&&(e.add(hu(t,26,`#ffd98a`,l,u+.05,(a.height-5)/16,.7)),e.add(gu(t,l,u+.3,1.9,`#ffc56b`,.3)))}}function gd(){let e=bc(),t=new Kr,n=new fu,r=new H(G.grassDeep);t.background=r.clone(),t.add(dd(n,e)),e.buildings.forEach(e=>t.add(yu(n,e))),hd(t,n,e),e.buildings.forEach(e=>{e.style===`greenhouse`?t.add(gu(n,e.x+e.w/2,e.y+e.d+.6,2.5,`#bff0c0`,.18)):t.add(gu(n,e.doorX+.5,e.y+e.d+.5,1.4,`#ffcf73`,.22))});let i=new _d(t,n,e);return{id:`hub`,map:e,scene:t,grid:new Cu(e),lighting:n,interior:!1,update:(e,n,a,o)=>{r.set(G.grassDeep).multiplyScalar(1-a*.45),t.background.copy(r),i.update(e,n,a,o)}}}var _d=class{constructor(e,t,n){K(this,`sparkles`,[]),K(this,`flies`,[]),K(this,`butterflies`,[]);let r=pc(42),i=new q(4,1);i.hline(0,3,0,`#e8f7ff`);let a=du(i.toCanvas());for(let i=0;i<n.h;i++)for(let o=0;o<n.w;o++){if(n.ground[i][o]!==`water`||r()>.45)continue;let s=new ii(4/16,1/16*Z);s.rotateX(-Math.PI/2);let c=new xr(s,t.add(new Jn({map:a,transparent:!0})));c.position.set(o+.2+r()*.6,.02,(i+.2+r()*.6)*Z),c.userData.phase=r()*6,this.sparkles.push(c),e.add(c)}[[15,20],[24,21],[18,24],[22,19],[10,6],[13,7],[26,5],[6,11],[34,11],[8,23]].forEach(([n,r],i)=>{let a=hu(t,6,`#d8ff8a`,n,r,.6+i%3*.3,1);this.flies.push({m:a,x:n,y:r,ph:i*1.7}),e.add(a)}),[[12,10],[23,19],[7,8]].forEach(([n,r],i)=>{let a=document.createElement(`canvas`);a.width=14,a.height=6;let o=new q(14,6),s=i%2?G.flowerYellow:`#f2f2ff`;o.rect(1,1,2,2,s),o.rect(4,1,2,2,s),o.set(3,2,G.outline),o.rect(9,0,1,3,s),o.rect(11,0,1,3,s),o.set(10,2,G.outline),o.drawTo(a.getContext(`2d`),0,0);let c=du(a);c.repeat.set(.5,1);let l=new xr(new ii(7/16,6/16*Z*.707),t.add(new Jn({map:c,alphaTest:.5})));l.rotation.x=-Math.PI/4,this.butterflies.push({m:l,x:n,y:r,ph:i*2.1,tex:c}),e.add(l)})}update(e,t,n,r){this.sparkles.forEach(e=>{e.visible=r?!0:Math.sin(t*1.6+e.userData.phase)>.3}),this.flies.forEach(e=>{let n=r?e.ph:t*.5+e.ph;e.m.position.x=e.x+Math.sin(n)*.9,e.m.position.z=(e.y+Math.cos(n*.7)*.6)*Z,e.m.position.y=(.8+Math.sin(n*1.3)*.3)*Z}),this.butterflies.forEach(e=>{e.m.visible=n<.4;let i=r?e.ph:t*.6+e.ph;e.m.position.set(e.x+Math.sin(i)*1.6,(1.2+Math.sin(i*2.3)*.25)*Z,(e.y+Math.sin(i*.8)*1)*Z),e.tex.offset.x=!r&&Math.sin(t*18+e.ph)>0?.5:0})}};function vd(e){let t=new q(160,40);t.rect(0,0,160,40,`#efe0bf`);for(let e=4;e<160;e+=8)t.vline(e,0,28,`#e2cfa6`);for(let e=8;e<160;e+=16)for(let n=5;n<26;n+=9)t.set(e,n,`#d9826a`);t.rect(0,28,160,12,G.wood1),t.hline(0,159,28,G.wood3);for(let e=0;e<160;e+=10)t.vline(e,29,39,G.wood2);return t.rect(0,0,160,2,G.woodDark),t.rect(112,6,28,20,G.wood2),t.rect(114,8,24,16,e?`#2b3a66`:`#9fd3ee`),e?([[4,4],[15,7],[20,3],[9,11]].forEach(([e,n])=>t.set(114+e,8+n,`#fff6c8`)),t.ellipse(129,14,5,5,`#f3e3b5`)):(t.ellipse(114,17,10,8,`#7cb356`),t.ellipse(122,18,14,7,`#6aa24a`),t.rect(117,10,5,2,G.white)),t.vline(125,8,23,G.wood2),t.hline(114,137,15,G.wood2),t.rect(110,26,32,3,G.wood3),t.rect(64,7,16,14,G.wood2),t.rect(66,9,12,10,G.paper),t.ellipse(68,10,8,8,`#c9483f`),t.vline(72,14,18,G.woodDark),t.toCanvas()}function yd(){let e=Sc(),t=new Kr,n=new fu;t.background=new H(`#1e1622`),t.add(dd(n,e));let r=du(vd(!1)),i=du(vd(!0)),a=n.add(new Jn({map:r})),o=new ii(10,2.5*Z);o.translate(0,2.5*Z/2,0);let s=new xr(o,a);s.position.set(5,0,2*Z),t.add(s);let c=(e,r,i,a=0)=>{let o=pu(n,cu(e).toCanvas(),r,i,{lift:a,name:e});return t.add(o),o};c(`bed`,2,3.95),c(`wardrobe`,4.5,2.95),c(`shelf`,6.5,2.95),c(`desk`,8,2.95),c(`lampdesk`,8.85,2.96,22/16),c(`plantstand`,1.5,7.8);let l=new q(32,10);l.rect(1,1,30,8,`#8a5a3a`),l.rect(3,3,26,4,`#a4553d`);let u=new ii(2,10/16*Z);u.rotateX(-Math.PI/2);let d=new xr(u,n.add(new Jn({map:du(l.toCanvas()),alphaTest:.5})));d.position.set(5,.01,8.4*Z),t.add(d);let f=pu(n,uu().toCanvas(),8.3,2.03,{lift:11/16,name:`pot`});return f.visible=!1,t.add(f),t.add(hu(n,40,`#ffd88a`,8.85,3,1.6,.55)),{id:`room`,map:e,scene:t,grid:new Cu(e),lighting:n,interior:!0,update:(e,t,n)=>{let o=n>.5?i:r;a.map!==o&&(a.map=o,a.needsUpdate=!0)},setPotPlanted:e=>{f.visible=e}}}function bd(e){let t=new q(224,40);t.rect(0,0,224,40,`#e8dcc2`);for(let e=6;e<224;e+=12)t.vline(e,0,27,`#dccfb2`);t.rect(0,28,224,12,G.wood2),t.hline(0,223,28,G.wood3);for(let e=0;e<224;e+=12)t.vline(e,29,39,G.wood1);t.rect(0,0,224,2,G.woodDark),t.rect(72,5,80,22,G.wood2),t.rect(74,7,76,18,`#2f5a45`),t.hline(80,142,18,`#e8f0e8`);for(let e=0;e<7;e++){let n=82+e*10;t.rect(n,16,3,5,`#e8f0e8`),t.hline(n-1,n+3,12-e%2*2,`#cfe0cf`)}t.rect(102,26,20,2,G.wood3),t.set(106,25,G.white);for(let n of[18,176])t.rect(n,6,28,20,G.wood2),t.rect(n+2,8,24,16,e?`#2b3a66`:`#9fd3ee`),e?t.set(n+8,11,`#fff6c8`):t.ellipse(n+4,16,12,8,`#7cb356`),t.vline(n+13,8,23,G.wood2),t.hline(n+2,n+25,15,G.wood2);return t.ellipse(158,6,10,10,G.white),t.set(163,9,G.outline),t.set(163,10,G.outline),t.set(164,11,G.outline),t.toCanvas()}function xd(){let e=Ec(),t=new Kr,n=new fu;t.background=new H(`#1e1622`),t.add(dd(n,e));let r=du(bd(!1)),i=du(bd(!0)),a=n.add(new Jn({map:r})),o=new ii(14,2.5*Z);o.translate(0,2.5*Z/2,0);let s=new xr(o,a);s.position.set(7,0,2*Z),t.add(s);let c=lu(`desk`).toCanvas();for(let[e,r]of[[4,4.95],[10,4.95],[4,6.95],[10,6.95]])t.add(pu(n,c,e,r,{name:`desk`}));return wc.forEach(([e,r],i)=>t.add(pu(n,Sd(i),e+.5,r+.8,{name:`easel`}))),t.add(pu(n,lu(`globe`).toCanvas(),12.5,7.8,{name:`globe`})),t.add(hu(n,48,`#ffd88a`,7,3,1.9,.35)),{id:`school`,map:e,scene:t,grid:new Cu(e),lighting:n,interior:!0,update:(e,t,n)=>{let o=n>.5?i:r;a.map!==o&&(a.map=o,a.needsUpdate=!0)}}}function Sd(e){let t=lu(`easel`,e).toCanvas(),n=Tc[e];if(!n)return t;let r=document.createElement(`canvas`);r.width=28,r.height=22;let i=r.getContext(`2d`);i.imageSmoothingEnabled=!0,i.imageSmoothingQuality=`high`,i.drawImage(ud(n),0,0,28,22);let a=t.getContext(`2d`);return a.imageSmoothingEnabled=!0,a.drawImage(r,3,4,14,11),t}function Cd(){let e=kc(),t=new Kr,n=new fu,r=new H(G.grassDeep);return t.background=r.clone(),t.add(dd(n,e)),hd(t,n,e),t.add(hu(n,30,`#ffd98a`,7.5,2.7,1.2,.45)),{id:`farm`,map:e,scene:t,grid:new Cu(e),lighting:n,interior:!1,update:(e,n,i)=>{r.set(G.grassDeep).multiplyScalar(1-i*.45),t.background.copy(r)}}}function $(e,t={},...n){let r=document.createElement(e);for(let[e,n]of Object.entries(t))n!==void 0&&n!==!1&&(e.startsWith(`on`)&&typeof n==`function`?r.addEventListener(e.slice(2).toLowerCase(),n):e===`class`?r.className=String(n):e===`text`?r.textContent=String(n):n===!0?r.setAttribute(e,``):r.setAttribute(e,String(n)));for(let e of n)e!=null&&e!==!1&&r.append(e);return r}var wd=`button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])`,Td=[],Ed=!1;function Dd(){Ed||(Ed=!0,window.addEventListener(`keydown`,e=>{let t=Td[Td.length-1];t&&t.handleKey(e)},!0))}var Od=class{constructor(e,t,n,r={}){K(this,`root`,void 0),K(this,`onClose`,void 0),K(this,`back`,void 0),K(this,`returnFocus`,void 0),K(this,`onKey`,void 0),K(this,`closed`,!1),this.root=t,this.onClose=n,this.returnFocus=document.activeElement,this.back=$(`div`,{class:`modal-back`}),this.back.append(t),r.closeOnBackdrop!==!1&&this.back.addEventListener(`pointerdown`,e=>{e.target===this.back&&this.close()}),this.onKey=e=>{e.key===`Escape`?(e.stopPropagation(),e.preventDefault(),r.escapeCloses!==!1&&this.close()):e.key===`Tab`?this.trap(e):!this.root.contains(document.activeElement)&&[`Enter`,` `].includes(e.key)&&(e.preventDefault(),e.stopPropagation(),this.root.querySelector(wd)?.focus())},Dd(),Td.push(this),e.append(this.back),requestAnimationFrame(()=>{(t.querySelector(`[data-autofocus]`)??t.querySelector(wd))?.focus()})}handleKey(e){this.onKey(e)}trap(e){let t=Array.from(this.root.querySelectorAll(wd)).filter(e=>e.offsetParent!==null);if(!t.length)return;let n=t[0],r=t[t.length-1];e.shiftKey&&document.activeElement===n?(e.preventDefault(),r.focus()):!e.shiftKey&&document.activeElement===r&&(e.preventDefault(),n.focus())}close(){if(this.closed)return;this.closed=!0;let e=Td.indexOf(this);e>=0&&Td.splice(e,1),this.back.remove(),this.returnFocus instanceof HTMLElement&&document.contains(this.returnFocus)&&this.returnFocus.focus(),this.onClose?.()}};function kd(e,t,n,r){return new Promise(i=>{let a=null,o=`dlg-${Math.random().toString(36).slice(2)}`,s=$(`div`,{class:`panel modal`,role:`dialog`,"aria-modal":`true`,"aria-labelledby":o,style:`width:min(480px,100%)`},$(`header`,{},$(`h2`,{id:o,text:t})),$(`div`,{class:`content`},$(`p`,{style:`margin:0 0 14px;line-height:1.45`,text:n}))),c=$(`div`,{style:`display:flex;flex-direction:column;gap:10px;padding:0 16px 16px`});r.forEach((e,t)=>c.append($(`button`,{class:`btn ${e.kind??``}`,text:e.label,"data-autofocus":t===0||void 0,onclick:()=>{a=e.id,l.close()}}))),s.append(c);let l=new Od(e,s,()=>i(a))})}var Ad=[{key:`skin`,legend:`Skin tone`,options:Ws.map(e=>({id:e.id,name:e.name,color:e.base}))},{key:`hairStyle`,legend:`Hair style`,options:qs.map(e=>({id:e.id,name:e.name}))},{key:`hairColor`,legend:`Hair color`,options:Gs.map(e=>({id:e.id,name:e.name,color:e.base}))},{key:`outfit`,legend:`Outfit color`,options:Ks.map(e=>({id:e.id,name:e.name,color:e.base}))},{key:`accessory`,legend:`Accessory (optional)`,options:Js.map(e=>({id:e.id,name:e.name}))}];function jd(e,t,n,r){let i={...t},a=document.createElement(`canvas`);a.width=16,a.height=24,a.setAttribute(`role`,`img`);let o=`down`,s=0,c=0,l=()=>{let e=a.getContext(`2d`);e.clearRect(0,0,16,24),nc(ec(i),o,s).drawTo(e,0,0);let t=Ad.map(e=>e.options.find(t=>t.id===i[e.key])?.name).join(`, `);a.setAttribute(`aria-label`,`Your explorer, facing ${o}: ${t}`)},u=e=>{let t=[`down`,`left`,`up`,`right`];o=t[(t.indexOf(o)+e+4)%4],l()},d=window.setInterval(()=>{il.reducedMotion||(c++,s=[0,1,0,2][c%4],l())},380),f=$(`div`,{style:`flex:1;min-width:0`}),p=new Map,m=()=>{p.forEach((e,t)=>e.forEach(e=>{let n=e.dataset.id===i[t];e.setAttribute(`aria-checked`,String(n)),e.tabIndex=n?0:-1})),l()};Ad.forEach(e=>{let t=`leg-${e.key}`,n=$(`div`,{class:`swatches`,role:`radiogroup`,"aria-labelledby":t}),r=[];e.options.forEach((t,a)=>{let o=$(`button`,{class:`swatch${t.color&&e.key!==`hairStyle`?` color`:``}`,type:`button`,role:`radio`,"data-id":t.id,"aria-label":t.name,title:t.name,style:t.color?`background:${t.color}`:void 0,onclick:()=>{i[e.key]=t.id,Q.click(),m()},onkeydown:t=>{let n=t.key;if(![`ArrowRight`,`ArrowDown`,`ArrowLeft`,`ArrowUp`].includes(n))return;t.preventDefault();let o=(a+(n===`ArrowRight`||n===`ArrowDown`?1:e.options.length-1))%e.options.length;i[e.key]=e.options[o].id,m(),r[o].focus()}},t.color?``:t.name);r.push(o),n.append(o)}),p.set(e.key,r),f.append($(`fieldset`,{},$(`legend`,{id:t,text:e.legend}),n))});let h=new Od(e,$(`div`,{class:`panel modal customize`,role:`dialog`,"aria-modal":`true`,"aria-labelledby":`cust-title`},$(`header`,{},$(`h2`,{id:`cust-title`,text:n.firstTime?`Create your explorer`:`Change your look`})),$(`div`,{class:`cols`},$(`div`,{class:`preview`},a,$(`div`,{style:`display:flex;gap:8px`},$(`button`,{class:`btn small`,type:`button`,text:`Turn left`,onclick:()=>u(-1)}),$(`button`,{class:`btn small`,type:`button`,text:`Turn right`,onclick:()=>u(1)}))),f),$(`footer`,{},$(`button`,{class:`btn`,type:`button`,text:`Surprise me`,onclick:()=>{let e=e=>e[Math.floor(Math.random()*e.length)];i.skin=e(Ws).id,i.hairStyle=e(qs).id,i.hairColor=e(Gs.slice(0,5)).id,i.outfit=e(Ks).id,i.accessory=Math.random()<.5?`none`:e(Js).id,m()}}),$(`button`,{class:`btn primary`,type:`button`,"data-autofocus":!0,text:n.firstTime?`I'm ready!`:`Done`,onclick:()=>h.close()}))),()=>{window.clearInterval(d),r({...i})},{closeOnBackdrop:!1,escapeCloses:!n.firstTime});return m(),h}function Md(e,t,n={}){let r=new q(48,48),i=e.skin,a=e.hair,o=e.extras?.jacket??e.shirt;r.ellipse(4,38,40,18,o.base),r.rect(4,44,40,4,o.base),r.ellipse(4,40,10,10,o.shade),r.rect(19,33,10,7,i.shade);let s=e.extras;if(s?.jacket){r.rect(18,38,12,10,G.white),r.rect(22,39,4,9,s.tie??G.outline),r.set(23,38,J(s.tie??G.outline,G.white,.2));for(let e=0;e<7;e++)r.set(17-Math.floor(e/2),39+e,o.shade),r.set(30+Math.floor(e/2),39+e,o.shade);s.lapelFlower&&(r.ellipse(9,40,5,5,s.lapelFlower),r.set(11,41,J(s.lapelFlower,G.white,.5)),r.set(11,42,G.flowerYellow),r.set(13,45,G.leaf2),r.set(12,45,G.leaf1))}else r.rect(20,38,8,3,i.shade);s?.apron&&(r.rect(14,42,20,6,s.apron),r.vline(15,38,42,s.apron),r.vline(32,38,42,s.apron)),a.style===`curly`&&r.ellipse(6,2,36,34,a.base),(a.style===`long`||a.style===`locs`||a.style===`braids`)&&r.rect(9,12,30,26,a.shade),r.ellipse(11,6,26,32,i.base),r.ellipse(8,18,5,8,i.base),r.ellipse(35,18,5,8,i.shade);for(let e=10;e<38;e++)for(let t=28;t<38;t++)r.get(t,e)===i.base&&(t-28)*2+(e-10)*.4>12&&r.set(t,e,i.shade);r.hline(17,30,37,i.shade);let c=`#fbf6ec`,l=G.outline,u=a.style===`wrap`?J(i.shade,G.outline,.5):a.shade;switch(t){case`smile`:case`proud`:[17,28].forEach(e=>{r.hline(e,e+3,21,l),r.set(e-1,22,l),r.set(e+4,22,l)});break;case`thinking`:[17,28].forEach(e=>{r.rect(e,20,4,4,c),r.rect(e+2,20,2,2,l)});break;default:[17,28].forEach(e=>{r.rect(e,20,4,4,c),r.rect(e+1,20,2,4,l),r.set(e+1,20,G.white)})}t===`curious`?(r.hline(16,20,17,u),r.hline(28,32,16,u)):t===`thinking`?(r.hline(16,20,18,u),r.hline(28,32,17,u)):(r.hline(16,20,18,u),r.hline(28,32,18,u)),r.vline(24,22,27,i.shade),r.hline(22,25,28,i.shade);let d=J(i.shade,G.outline,.45);switch(t===`proud`?(r.hline(20,28,32,d),r.rect(21,33,7,2,`#8e3b3b`),r.hline(22,26,33,G.white)):t===`smile`?(r.hline(21,27,32,d),r.set(20,31,d),r.set(28,31,d)):t===`curious`?r.rect(23,31,3,3,d):r.hline(21,27,32,d),n.elder&&(r.set(15,24,i.shade),r.set(32,24,i.shade),r.hline(20,23,11,i.shade),r.hline(25,28,12,i.shade),r.vline(19,27,29,i.shade),r.vline(29,27,29,i.shade)),s?.mustache&&(r.rect(18,29,13,3,s.mustache),r.hline(19,29,28,s.mustache),r.set(17,31,s.mustache),r.set(31,31,s.mustache),r.hline(19,29,31,J(s.mustache,G.outline,.2))),s?.beard&&(r.ellipse(14,28,21,12,s.beard),r.rect(20,31,9,2,d)),a.style){case`carver`:r.ellipse(11,3,26,13,a.base),r.rect(10,10,3,9,a.base),r.rect(35,10,3,9,a.base),r.ellipse(14,10,20,6,i.base);for(let e=12;e<36;e+=2)for(let t=4;t<12;t+=3)r.get(e,t)===a.base&&(e+t)%4==0&&r.set(e,t,a.shade);r.hline(17,26,5,a.light);break;case`wrap`:{let t=e.accent;r.ellipse(8,0,32,18,t),r.rect(10,9,28,4,t),r.hline(10,37,13,J(t,G.outline,.3)),r.ellipse(26,0,12,8,J(t,G.white,.15));for(let e=12;e<36;e+=4)r.set(e,6,J(t,G.outline,.25));break}case`curly`:r.ellipse(8,1,32,16,a.base);for(let e=0;e<40;e++){let t=8+e*13%32,n=2+e*7%14;r.get(t,n)===a.base&&r.set(t,n,a.shade)}r.ellipse(8,8,5,18,a.base),r.ellipse(35,8,5,18,a.base);break;default:r.ellipse(10,3,28,14,a.base),r.rect(10,9,3,10,a.base),r.rect(35,9,3,10,a.base),r.hline(16,22,6,a.light),a.style===`puffs`&&(r.ellipse(3,0,13,13,a.base),r.ellipse(32,0,13,13,a.base),r.set(7,3,a.light),r.set(36,3,a.light)),(a.style===`long`||a.style===`locs`||a.style===`braids`)&&(r.rect(8,12,4,26,a.base),r.rect(36,12,4,26,a.base)),a.style===`bun`&&r.ellipse(19,0,10,8,a.base)}if(e.accessory===`glasses`){let e=`#39364a`;[15,27].forEach(t=>{r.hline(t,t+6,19,e),r.hline(t,t+6,24,e),r.vline(t,19,24,e),r.vline(t+6,19,24,e)}),r.hline(22,27,21,e)}if(e.accessory===`sunhat`){let t=`#e2c27a`;r.ellipse(2,5,44,10,`#c7a55c`),r.ellipse(3,4,42,9,t),r.ellipse(12,0,24,11,t),r.rect(12,6,24,3,e.accent);for(let e=6;e<42;e+=4)r.set(e,9,`#c7a55c`)}return e.accessory===`cap`&&(r.ellipse(10,1,28,12,e.accent),r.rect(10,8,28,3,e.accent),r.rect(8,11,32,2,J(e.accent,G.outline,.3))),r.outline()}function Nd(){return{attempts:0,correct:0,hintLevel:0,misconception:null,evidence:[],mastered:!1}}function Pd(e,t){return e[t]||(e[t]=Nd()),e[t]}function Fd(e,t,n){let r=Pd(e,t);return r.attempts+=1,n.correct?(r.correct+=1,n.evidence&&!r.evidence.includes(n.evidence)&&(r.evidence.push(n.evidence),r.evidence.length>12&&r.evidence.shift()),r.hintLevel<=1&&(r.mastered=!0)):n.misconception&&(r.misconception=n.misconception),r}function Id(e,t){let n=Pd(e,t),r=Math.min(3,n.hintLevel+1);return n.hintLevel=r,r}var Ld={name:`authored`,async getHint(e){return e.authoredHint}};function Rd(e,t=2500){return e?{name:`remote`,async getHint(n){let r=new AbortController,i=setTimeout(()=>r.abort(),t);try{let t=await fetch(e,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({objectiveId:n.objectiveId,rung:n.rung,hint:n.authoredHint}),signal:r.signal});if(!t.ok)return n.authoredHint;let i=await t.json();return typeof i.hint==`string`&&i.hint.trim()?i.hint:n.authoredHint}catch{return n.authoredHint}finally{clearTimeout(i)}}}:Ld}var zd=Rd(void 0),Bd=new Map;function Vd(e,t){let n=`${e.id}:${t}`,r=Bd.get(n);return r||(r=Md(e.look,t,{elder:[`carver`,`odell`,`amos`].includes(e.id)}).toDataURL(3),Bd.set(n,r)),r}var Hd=class{constructor(e,t){K(this,`host`,void 0),K(this,`hooks`,void 0),K(this,`el`,null),K(this,`live`,void 0),K(this,`resolveAdvance`,null),K(this,`typing`,!1),K(this,`finishTyping`,null),K(this,`skipping`,!1),K(this,`keyHandler`,e=>this.onKey(e)),K(this,`suspended`,!1),K(this,`jumpTo`,void 0),K(this,`sensitiveEl`,void 0),K(this,`choiceResolve`,null),K(this,`portrait`,void 0),K(this,`nameEl`,void 0),K(this,`roleEl`,void 0),K(this,`badgeEl`,void 0),K(this,`textEl`,void 0),K(this,`feedbackEl`,void 0),K(this,`choicesEl`,void 0),K(this,`footerHint`,void 0),K(this,`skipBtn`,void 0),K(this,`voice`,220),this.host=e,this.hooks=t}get isOpen(){return!!this.el}async run(e,t={}){if(this.el)return;this.skipping=!1,this.build(),Q.open(),window.addEventListener(`keydown`,this.keyHandler,!0);let n=e.start,r=!1,i=0;try{for(;n&&i++<200;){let i=e.nodes[n];if(!i)break;if(t.replay||await this.applyAll(i.effects),i.kind===`question`){await this.ask(i,!!t.replay)>1&&(r=!0),n=i.next;continue}let a=i,o=this.resolve(r&&a.textIfRetried?a.textIfRetried:a.text);if(this.showSpeaker(i),this.showSensitive(a.sensitive),await this.type(o),this.jumpTo!==void 0){n=this.takeJump();continue}let s=(a.choices??[]).filter(e=>!e.requiresFlag);if(s.length){this.skipping=!1;let e=await this.choose(s.map(e=>e.text));if(e<0){n=this.takeJump();continue}let r=s[e];t.replay||await this.applyAll(r.effects),n=r.next}else await this.waitAdvance(),n=this.jumpTo===void 0?a.next??null:this.takeJump()}}finally{window.removeEventListener(`keydown`,this.keyHandler,!0),this.el?.remove(),this.el=null,Q.close()}}takeJump(){let e=this.jumpTo??null;return this.jumpTo=void 0,this.showSensitive(void 0),e}showSensitive(e){if(!e){this.sensitiveEl.hidden=!0;return}this.sensitiveEl.hidden=!1,this.sensitiveEl.replaceChildren($(`span`,{text:`This part talks about unfair treatment because of race. You can read it, or skip it and replay it later from your journal.`}),$(`button`,{class:`btn small`,type:`button`,text:`Skip this part`,onclick:t=>{t.stopPropagation(),this.jumpTo=e.skipTo,this.typing&&this.finishTyping&&this.finishTyping();let n=this.resolveAdvance;this.resolveAdvance=null,n?.();let r=this.choiceResolve;this.choiceResolve=null,r?.(-1)}}))}async applyAll(e){for(let t of e??[]){let e=this.hooks.apply(t);if(e instanceof Promise){this.suspended=!0,this.el&&(this.el.style.visibility=`hidden`);try{await e}finally{this.suspended=!1,this.el&&(this.el.style.visibility=``)}}}}resolve(e){return this.hooks.resolve?this.hooks.resolve(e):e}build(){this.portrait=$(`img`,{class:`portrait`,alt:``}),this.nameEl=$(`span`,{class:`name`}),this.roleEl=$(`span`,{class:`role`}),this.badgeEl=$(`span`,{class:`badge`,text:`Real scientist · words written for this story`}),this.textEl=$(`div`,{class:`text`,"aria-hidden":`true`}),this.live=$(`div`,{class:`sr-only`,"aria-live":`polite`}),this.feedbackEl=$(`div`,{class:`feedback`,hidden:!0}),this.sensitiveEl=$(`div`,{class:`sensitive-note`,hidden:!0,role:`note`}),this.choicesEl=$(`ul`,{class:`choices`}),this.footerHint=$(`span`,{class:`continue-hint`}),this.skipBtn=$(`button`,{class:`btn small`,type:`button`,text:`Skip ahead`,"aria-label":`Skip ahead to the next choice (items are still given)`,onclick:e=>{e.stopPropagation(),this.skipping=!0,this.advance()}}),this.el=$(`section`,{class:`panel dialogue`,role:`dialog`,"aria-label":`Conversation`},this.portrait,$(`div`,{class:`body`},$(`div`,{class:`nameplate`},this.nameEl,this.roleEl,this.badgeEl),this.sensitiveEl,this.textEl,this.live,this.feedbackEl,this.choicesEl,$(`div`,{class:`footer`},this.footerHint,this.skipBtn))),this.el.addEventListener(`click`,e=>{e.target.closest(`button`)||this.advance()}),this.host.append(this.el)}showSpeaker(e){let t=Gc(e.speaker);t?(this.portrait.src=Vd(t,e.expression??`neutral`),this.portrait.alt=`${t.name}, looking ${e.expression??`friendly`}`,this.portrait.hidden=!1,this.nameEl.textContent=t.name,this.roleEl.textContent=t.role,this.badgeEl.hidden=t.id!==`carver`,this.voice=t.voice):(this.portrait.hidden=!0,this.nameEl.textContent=``,this.roleEl.textContent=``,this.badgeEl.hidden=!0)}type(e){this.choicesEl.replaceChildren(),this.feedbackEl.hidden=!0,this.live.textContent=`${this.nameEl.textContent}: ${e}`,this.footerHint.textContent=``;let t=ll();return t===0||this.skipping?(this.textEl.textContent=e,Promise.resolve()):new Promise(n=>{this.typing=!0;let r=0,i=performance.now(),a=0,o=()=>{this.typing=!1,this.finishTyping=null,this.textEl.textContent=e,n()};this.finishTyping=o;let s=n=>{if(!this.typing)return;a+=(n-i)/1e3*t,i=n;let c=Math.min(e.length,r+Math.floor(a));c>r&&(a-=c-r,Math.floor(c/3)!==Math.floor(r/3)&&/\S/.test(e[c-1]??``)&&Q.blip(this.voice),r=c,this.textEl.textContent=e.slice(0,r)),r>=e.length?o():requestAnimationFrame(s)};requestAnimationFrame(s)})}waitAdvance(){return this.skipping?Promise.resolve():(this.footerHint.textContent=`Click, or press Space, to continue`,new Promise(e=>this.resolveAdvance=e))}advance(){if(this.typing&&this.finishTyping){this.finishTyping();return}let e=this.resolveAdvance;this.resolveAdvance=null,e?.()}onKey(e){if(!this.el||this.suspended)return;let t=e.key,n=e.target?.tagName===`BUTTON`;if((t===` `||t===`Enter`||t.toLowerCase()===`e`)&&!n){e.preventDefault(),e.stopPropagation(),this.advance();return}let r=Array.from(this.choicesEl.querySelectorAll(`button:not([disabled])`));if(/^[1-9]$/.test(t)&&r.length){let n=this.choicesEl.querySelectorAll(`button`)[Number(t)-1];n&&!n.disabled&&(e.preventDefault(),e.stopPropagation(),n.click());return}if((t===`ArrowDown`||t===`ArrowUp`)&&r.length){e.preventDefault(),e.stopPropagation();let n=r.indexOf(document.activeElement);r[t===`ArrowDown`?(n+1)%r.length:(n-1+r.length)%r.length].focus();return}([`j`,`i`,`w`,`a`,`s`,`d`].includes(t.toLowerCase())||t.startsWith(`Arrow`))&&e.stopPropagation(),t===`Escape`&&e.stopPropagation()}choose(e,t={}){return this.footerHint.textContent=`Choose an answer`,new Promise(n=>{this.choiceResolve=n,this.choicesEl.replaceChildren(),e.forEach((e,r)=>{let i=$(`button`,{class:`btn${t.highlight===r?` worked`:``}`,type:`button`,disabled:t.disabled?.has(r),onclick:()=>{Q.click(),this.choiceResolve=null,n(r)}},$(`span`,{class:`num`,text:`${r+1}`}),$(`span`,{text:e}));this.choicesEl.append($(`li`,{},i))}),requestAnimationFrame(()=>this.choicesEl.querySelector(`button:not([disabled])`)?.focus())})}async ask(e,t){this.showSpeaker(e);let n=e.options.findIndex(e=>e.correct);if(t)return await this.type(this.resolve(e.text)),this.feedbackEl.hidden=!1,this.feedbackEl.className=`feedback good`,this.feedbackEl.textContent=`Answer: ${e.options[n].text}`,await this.waitAdvance(),1;await this.type(this.resolve(e.text));let r=new Set,i,a=0;for(;;){this.skipping=!1;let t=await this.choose(e.options.map(e=>e.text),{disabled:r,highlight:i});a++;let o=e.options[t];if(Fd(this.hooks.learner,e.objectiveId,{correct:o.correct,misconception:o.misconception,evidence:o.correct?`Chose "${o.text}"`:void 0}),this.hooks.onLearningChanged(),this.choicesEl.replaceChildren(),this.feedbackEl.hidden=!1,o.correct)return Q.correct(),this.feedbackEl.className=`feedback good`,this.feedbackEl.textContent=o.feedback,this.live.textContent=o.feedback,await this.waitAdvance(),this.feedbackEl.hidden=!0,a;Q.retry();let s=Id(this.hooks.learner,e.objectiveId);this.hooks.onLearningChanged();let c=await zd.getHint({objectiveId:e.objectiveId,rung:s,authoredHint:e.hints[s-1]});this.feedbackEl.className=`feedback try`,this.feedbackEl.textContent=`${o.feedback} ${c}`,this.live.textContent=this.feedbackEl.textContent,r.add(t),s>=3&&(i=n),this.textEl.textContent=this.resolve(e.text),il.textSpeed===`instant`&&(this.footerHint.textContent=``)}}},Ud={seedPacket:e=>{e.rect(3,2,10,12,G.paper2),e.rect(4,3,8,10,G.paper),e.hline(3,12,2,`#b89a68`),e.rect(5,5,6,4,G.leaf2),e.set(8,4,G.leaf3),e.set(6,6,G.flowerYellow),e.hline(5,10,11,G.ink)},folder:e=>{e.rect(1,4,14,10,`#c9a25a`),e.rect(1,3,6,2,`#c9a25a`),e.rect(2,6,12,7,`#e2c27a`),e.rect(4,2,9,8,G.paper),e.hline(5,11,4,G.ink),e.hline(5,9,6,G.ink)},sketch:e=>{e.rect(2,1,12,14,G.paper),e.ellipse(4,3,8,10,`#d9e8c4`),e.vline(8,3,13,G.ink),[[6,6],[10,7],[6,9],[10,10]].forEach(([t,n])=>e.set(t,n,G.ink)),e.rect(12,9,2,6,G.flowerYellow)},notebook:e=>{e.rect(3,1,10,14,`#3f7f3a`),e.rect(4,2,8,12,`#4f9a4a`),e.vline(3,1,14,`#2e5f2b`),e.rect(6,4,5,3,G.paper),e.hline(6,10,9,G.paper2),e.hline(6,9,11,G.paper2),e.rect(12,0,1,5,G.flowerYellow),e.set(12,5,G.ink)},lens:e=>{e.ellipse(1,1,10,10,G.metal),e.ellipse(2,2,8,8,`#cfeaf5`),e.set(4,4,G.white),e.set(5,4,G.white),e.set(4,5,G.white),[[10,10],[11,11],[12,12],[13,13],[14,14]].forEach(([t,n])=>e.rect(t,n,2,1,G.wood2))},card:e=>{e.rect(1,3,14,10,G.paper),e.rect(1,3,14,2,`#4f9a4a`),e.rect(3,7,3,3,G.paper2),e.rect(7,7,3,3,G.paper2),e.rect(11,7,2,3,G.paper2),e.set(4,8,G.leaf2),e.set(8,8,G.flowerBlue)},jar:e=>{e.rect(2,3,5,11,`#cfe3ea`),e.rect(3,7,3,6,`#b89468`),e.rect(2,2,5,2,G.wood2),e.rect(9,3,5,11,`#cfe3ea`),e.rect(10,7,3,6,`#4e3222`),e.rect(9,2,5,2,G.wood2),e.set(11,9,`#e08a8a`)},ledger:e=>{e.rect(2,1,12,14,`#7a3f2e`),e.rect(3,2,10,12,G.paper);for(let t of[4,6,8,10,12])e.hline(4,11,t,G.paper2);e.rect(4,4,2,1,G.white),e.set(9,8,G.leaf2),e.set(10,10,G.leaf2)},cropcards:e=>{e.rect(1,5,9,10,G.paper2),e.rect(4,3,9,10,G.paper),e.rect(4,3,9,2,`#c9a25a`),e.rect(6,1,9,10,G.paper),e.rect(6,1,9,2,G.leaf2),e.ellipse(8,4,5,5,G.leaf3),e.set(10,9,G.soil1),e.set(12,9,G.soil1)},seed:e=>{e.ellipse(4,3,8,11,`#c98c4a`),e.ellipse(5,4,4,6,`#e0ad6a`),e.vline(8,5,12,`#9a6a36`),e.set(8,2,G.leaf2),e.set(9,1,G.leaf3),e.set(7,1,G.leaf3)},star:e=>{e.rect(6,3,4,3,G.gold),[[7,1],[8,1],[7,2],[8,2],[6,3],[9,3],[6,4],[9,4]].forEach(([t,n])=>e.set(t,n,G.gold)),e.rect(1,5,14,3,G.gold),e.rect(3,8,10,2,G.gold),e.rect(4,10,8,2,G.gold),e.rect(3,12,3,2,G.gold),e.rect(10,12,3,2,G.gold),e.rect(6,4,2,3,`#fff1b8`)},journal:e=>{e.rect(2,2,12,12,`#7a3f2c`),e.rect(4,3,9,10,`#a4553d`),e.vline(4,2,13,`#5c2f22`),e.rect(7,5,4,3,G.paper),e.hline(12,13,9,G.gold),e.set(8,6,G.leaf2)},bag:e=>{e.rect(2,5,12,9,`#9a6a36`),e.rect(3,6,10,7,`#b88046`),e.hline(5,10,2,`#7a4f2a`),e.vline(4,3,5,`#7a4f2a`),e.vline(11,3,5,`#7a4f2a`),e.rect(6,8,4,3,`#7a4f2a`),e.set(7,9,G.gold)},gear:e=>{e.ellipse(3,3,10,10,G.metalLight),[[7,1],[8,1],[7,14],[8,14],[1,7],[1,8],[14,7],[14,8],[3,3],[12,3],[3,12],[12,12]].forEach(([t,n])=>e.rect(t,n,1,1,G.metalLight)),e.rect(7,0,2,2,G.metalLight),e.rect(7,14,2,2,G.metalLight),e.rect(0,7,2,2,G.metalLight),e.rect(14,7,2,2,G.metalLight),e.ellipse(6,6,4,4,G.metal)},sun:e=>{e.ellipse(4,4,8,8,G.gold),e.ellipse(5,5,4,4,`#ffe08a`),[[7,0],[8,0],[7,14],[8,14],[0,7],[0,8],[14,7],[14,8],[2,2],[13,2],[2,13],[13,13]].forEach(([t,n])=>e.rect(t,n,1,2,G.gold))},moon:e=>{e.ellipse(3,2,11,11,`#f3e3b5`),e.ellipse(7,1,9,9,null),e.set(6,9,`#d9c68e`),e.set(8,11,`#d9c68e`)},sunset:e=>{e.ellipse(3,5,10,10,`#f08a4b`),e.rect(0,11,16,4,null),e.hline(1,14,11,`#c9483f`),e.hline(3,12,13,`#c9483f`)},map:e=>{e.rect(1,3,14,10,G.paper),e.vline(5,3,12,G.paper2),e.vline(10,3,12,G.paper2),e.set(3,6,G.leaf2),e.set(7,9,G.water1),e.set(8,9,G.water1),e.rect(11,5,2,2,`#c9483f`)},check:e=>{e.ellipse(1,1,14,14,G.leaf2),[[4,8],[5,9],[6,10],[7,9],[8,8],[9,7],[10,6],[11,5]].forEach(([t,n])=>e.rect(t,n,1,2,G.white))},soundOn:e=>{e.rect(2,6,3,4,G.ink),e.rect(5,4,2,8,G.ink),e.rect(7,2,1,12,G.ink),e.vline(10,5,10,G.ink),e.vline(12,3,12,G.ink)},soundOff:e=>{e.rect(2,6,3,4,G.ink),e.rect(5,4,2,8,G.ink),e.rect(7,2,1,12,G.ink),[[10,5],[11,6],[12,7],[13,8],[14,9],[14,5],[13,6],[11,8],[10,9]].forEach(([t,n])=>e.rect(t,n,1,1,`#c9483f`))},talk:e=>{e.rect(1,2,14,9,G.white),e.rect(3,11,3,2,G.white),e.set(3,13,G.white),e.hline(4,11,5,G.ink),e.hline(4,9,8,G.ink)},leaf:e=>{e.ellipse(3,2,10,11,G.leaf2),e.vline(8,3,14,G.leaf1),e.set(6,6,G.leaf1),e.set(10,8,G.leaf1),e.set(5,4,G.leaf3)},lock:e=>{e.rect(3,7,10,8,G.gold),e.rect(5,2,6,6,null),e.vline(4,3,7,G.metal),e.vline(11,3,7,G.metal),e.hline(5,10,2,G.metal),e.rect(7,9,2,3,G.gold2)},question:e=>{e.hline(5,10,2,G.gold),e.rect(10,3,2,3,G.gold),e.rect(8,6,2,2,G.gold),e.rect(7,8,2,2,G.gold),e.rect(7,12,2,2,G.gold),e.rect(4,3,2,2,G.gold)}},Wd=new Map;function Gd(e,t=1){let n=`${e}@${t}`,r=Wd.get(n);if(r)return r;let i=new q(16,16);(Ud[e]??Ud.question)(i),i.outline();let a=i.toDataURL(t);return Wd.set(n,a),a}function Kd(e,t=``,n=24){let r=document.createElement(`img`);return r.src=Gd(e,2),r.alt=t,r.width=n,r.height=n,r.className=`px-icon`,r.draggable=!1,t||r.setAttribute(`aria-hidden`,`true`),r}var qd=class{constructor(e,t){K(this,`root`,void 0),K(this,`objText`,void 0),K(this,`objCard`,void 0),K(this,`levelEl`,void 0),K(this,`xpFill`,void 0),K(this,`xpLabel`,void 0),K(this,`seedsEl`,void 0),K(this,`clockIcon`,void 0),K(this,`clockText`,void 0),K(this,`saveInd`,void 0),K(this,`saveText`,void 0),K(this,`muteBtn`,void 0),K(this,`prompt`,void 0),K(this,`promptText`,void 0),K(this,`arrow`,void 0),K(this,`arrowHead`,void 0),K(this,`arrowText`,void 0),K(this,`toasts`,void 0),K(this,`tip`,void 0),K(this,`tipText`,void 0),K(this,`vignette`,void 0),K(this,`fade`,void 0),K(this,`saveTimer`,0),K(this,`lastObjective`,``),this.objText=$(`div`,{class:`text`}),this.objCard=$(`button`,{class:`panel objective`,type:`button`,"aria-label":`Next step. Open journal`,onclick:()=>t.journal()},Kd(`leaf`,``,28),$(`div`,{style:`text-align:left`},$(`div`,{class:`label`,text:`Next`}),this.objText)),this.levelEl=$(`span`,{text:`Lv 1`}),this.xpFill=$(`div`,{style:`width:0%`}),this.xpLabel=$(`span`,{class:`sr-only`}),this.seedsEl=$(`span`,{text:`0`}),this.clockIcon=Kd(`sun`,``,22),this.clockText=$(`span`,{class:`clock-text`}),this.saveText=$(`span`,{text:`Saved`}),this.saveInd=$(`div`,{class:`panel stat save-ind`,role:`status`,"aria-live":`polite`},Kd(`check`,``,20),this.saveText);let n=$(`div`,{class:`stats`},this.saveInd,$(`div`,{class:`panel stat`,title:`Level and XP`},Kd(`star`,``,22),this.levelEl,$(`div`,{class:`xpbar`,"aria-hidden":`true`},this.xpFill),this.xpLabel),$(`div`,{class:`panel stat`,title:`Seeds (for decorations)`},Kd(`seed`,``,22),this.seedsEl,$(`span`,{class:`sr-only`,text:`Seeds`})),$(`div`,{class:`panel stat`,title:`Time of day`},this.clockIcon,this.clockText));this.muteBtn=$(`button`,{class:`btn`,type:`button`,onclick:()=>t.toggleMute()});let r=(e,t,n,r)=>$(`button`,{class:`btn`,type:`button`,onclick:r,"aria-label":`${t} (${n})`},Kd(e,``,26),$(`span`,{text:t}),$(`span`,{class:`kbd`,text:n,"aria-hidden":`true`})),i=$(`nav`,{class:`toolbar`,"aria-label":`Game menu`},r(`journal`,`Journal`,`J`,()=>t.journal()),r(`bag`,`Bag`,`I`,()=>t.bag()),this.muteBtn,r(`gear`,`Settings`,`Esc`,()=>t.menu()));this.promptText=$(`span`),this.prompt=$(`button`,{class:`panel prompt`,type:`button`,hidden:!0,onclick:()=>t.interact()},$(`span`,{class:`kbd`,text:`E`,"aria-hidden":`true`}),this.promptText),this.arrowHead=$(`div`,{class:`arrow`}),this.arrowText=$(`span`),this.arrow=$(`div`,{class:`panel edge-arrow`,hidden:!0,"aria-hidden":`true`},this.arrowHead,this.arrowText),this.toasts=$(`div`,{class:`toasts`,role:`status`,"aria-live":`polite`}),this.tipText=$(`span`),this.tip=$(`div`,{class:`panel tip`,hidden:!0,role:`note`},Kd(`talk`,``,26),this.tipText),this.vignette=$(`div`,{class:`night-vignette`}),this.fade=$(`div`,{class:`fade`}),this.root=$(`div`,{class:`hud`},this.vignette,this.objCard,n,i,this.prompt,this.arrow,this.toasts,this.tip),e.append(this.root,this.fade),this.refreshMute(),Y.on(`save:status`,e=>this.showSave(e.status,e.message)),Y.on(`toast`,e=>this.toast(e.text,e.kind)),Y.on(`settings:changed`,()=>this.refreshMute())}setVisible(e){this.root.style.display=e?``:`none`}refreshMute(){let e=il.muted;this.muteBtn.replaceChildren(Kd(e?`soundOff`:`soundOn`,``,26),$(`span`,{text:e?`Sound off`:`Sound on`}),$(`span`,{class:`kbd`,text:`M`,"aria-hidden":`true`})),this.muteBtn.setAttribute(`aria-pressed`,e?`true`:`false`),this.muteBtn.setAttribute(`aria-label`,`Mute sound (M). Sound is ${e?`off`:`on`}`)}setObjective(e){if(e===this.lastObjective)return;let t=this.lastObjective===``;this.lastObjective=e,this.objText.textContent=e,this.objCard.setAttribute(`aria-label`,`Next: ${e}. Open journal`),t||(this.objCard.classList.remove(`pulse`),this.objCard.offsetWidth,this.objCard.classList.add(`pulse`))}setStats(e,t){let n=Yc(e);this.levelEl.textContent=`Lv ${n.level}`,this.xpFill.style.width=`${n.into/n.needed*100}%`,this.xpLabel.textContent=`${n.into} of ${n.needed} XP to the next level`,this.seedsEl.textContent=String(t)}setClock(e,t,n){let r=t>.6?`moon`:t>.05?`sunset`:`sun`;if(this.clockIcon.dataset.icon!==r){let e=Kd(r,``,22);this.clockIcon.src=e.src,this.clockIcon.dataset.icon=r}this.clockText.textContent=_l(e)+(n?` (paused)`:``),this.vignette.style.opacity=String(t*.9)}showSave(e,t){this.saveText.textContent=t??{saving:`Saving…`,saved:`Saved`,error:`Could not save`,recovered:`Save restored`}[e],this.saveInd.classList.add(`show`),window.clearTimeout(this.saveTimer),e!==`error`&&(this.saveTimer=window.setTimeout(()=>this.saveInd.classList.remove(`show`),1800))}setPrompt(e,t=0,n=0){if(!e){this.prompt.hidden=!0;return}this.prompt.hidden=!1,this.promptText.textContent=e,this.prompt.setAttribute(`aria-label`,`${e} (E)`);let r=this.root.clientWidth;this.prompt.style.left=`${Math.min(r-90,Math.max(90,t))}px`,this.prompt.style.top=`${Math.max(56,n)}px`}setArrow(e,t=0,n=0,r=0,i=0){if(!e){this.arrow.hidden=!0;return}let a=this.root.clientWidth,o=this.root.clientHeight,s=r-t,c=i-n,l=s===0?1/0:((s>0?a-70:70)-t)/s,u=c===0?1/0:((c>0?o-110:90)-n)/c,d=Math.min(l,u),f=t+s*d,p=n+c*d;this.arrow.hidden=!1,this.arrow.style.left=`${f}px`,this.arrow.style.top=`${p}px`,this.arrowHead.style.transform=`rotate(${Math.atan2(c,s)}rad)`,this.arrowText.textContent=e}toast(e,t=`info`){let n=t===`item`?`bag`:t===`reward`?`star`:t===`hint`?`leaf`:`talk`,r=$(`div`,{class:`panel toast ${t}`},Kd(n,``,24),$(`span`,{text:e}));for(this.toasts.append(r);this.toasts.children.length>3;)this.toasts.firstElementChild?.remove();window.setTimeout(()=>r.remove(),4200)}showTip(e){this.tip.hidden=!e,e&&(this.tipText.textContent=e)}},Jd=[{title:`George Washington Carver (biography)`,publisher:`National Park Service`,url:`https://www.nps.gov/people/george-washington-carver.htm`},{title:`George Washington Carver at Tuskegee Institute`,publisher:`National Park Service, Tuskegee Institute National Historic Site`,url:`https://www.nps.gov/tuin/learn/historyculture/george-washington-carver.htm`},{title:`Carver and soil productivity`,publisher:`USDA National Agricultural Library`,url:`https://www.nal.usda.gov/exhibits/ipd/carver/exhibits/show/soil/soil-productivity`}],Yd=[{id:`quest`,label:`Quest`,icon:`leaf`},{id:`bag`,label:`Bag`,icon:`bag`},{id:`map`,label:`Map`,icon:`map`},{id:`talks`,label:`Talks`,icon:`talk`},{id:`about`,label:`About`,icon:`journal`}];function Xd(e,t,n=`quest`,r){let i=new Map,a=$(`div`,{class:`content`,role:`tabpanel`,tabindex:`0`}),o=$(`div`,{class:`tabs`,role:`tablist`,"aria-label":`Journal sections`}),s=n,c=(e,t=!1)=>{s=e,i.forEach((t,n)=>{t.setAttribute(`aria-selected`,String(n===e)),t.tabIndex=n===e?0:-1}),a.setAttribute(`aria-labelledby`,`tab-${e}`),a.replaceChildren(u(e)),a.scrollTop=0,t&&i.get(e)?.focus()};Yd.forEach((e,t)=>{let n=$(`button`,{role:`tab`,id:`tab-${e.id}`,type:`button`,onclick:()=>c(e.id),onkeydown:e=>{let n=e.key;if(n===`ArrowRight`||n===`ArrowLeft`){e.preventDefault();let r=(t+(n===`ArrowRight`?1:Yd.length-1))%Yd.length;c(Yd[r].id,!0)}}},Kd(e.icon,``,20),` ${e.label}`);i.set(e.id,n),o.append(n)});let l=new Od(e,$(`div`,{class:`panel modal`,role:`dialog`,"aria-modal":`true`,"aria-labelledby":`journal-title`},$(`header`,{},$(`h2`,{id:`journal-title`},`Field Journal`),$(`button`,{class:`btn small`,type:`button`,text:`Close (Esc)`,onclick:()=>l.close()})),o,a),r);c(s),requestAnimationFrame(()=>i.get(s)?.focus());function u(e){switch(e){case`quest`:return d();case`bag`:return f();case`map`:return p();case`talks`:return m();case`about`:return h()}}function d(){let e=t.engine,n=$(`div`),r=e.nextAction();n.append($(`div`,{class:`section`},$(`div`,{class:`next-box`},Kd(`leaf`,``,28),$(`span`,{},$(`span`,{class:`sr-only`,text:`Next: `}),r.text))));let i=e.currentChapter()??[...e.allChapters()].reverse().find(t=>e.progress(t.id).stage===`complete`);if(i){let r=e.progress(i.id),a=r.stage===`complete`?`Complete`:r.stage===`active`?`In progress`:`Not started`;if(n.append($(`div`,{class:`section`},$(`h3`,{},`${i.number===0?`Practice quest`:`Chapter ${i.number}`}: ${i.title}`),$(`p`,{style:`margin:0 0 6px`},$(`strong`,{text:`Carver's assignment: `}),i.assignment),$(`p`,{style:`margin:0 0 6px`},$(`strong`,{text:`Why it matters: `}),i.whyItMatters),$(`p`,{style:`margin:0`},$(`strong`,{text:`Status: `}),a),$(`button`,{class:`btn small`,type:`button`,style:`margin-top:10px`,text:`Show me where Carver is`,onclick:()=>{l.close(),t.findCarver()}}))),r.stage!==`available`){let t=e.leads(i.id);n.append($(`div`,{class:`section`},$(`h3`,{text:`People to talk to`}),$(`ul`,{class:`checklist`},...t.map(e=>{let t=Gc(e.npcId);return $(`li`,{},$(`span`,{class:`state${e.done?` done`:``}`,text:e.done?`Talked`:`To do`}),$(`span`,{},$(`strong`,{text:`${t?.name??e.npcId}: `}),e.lead))}))));let r=e.itemChecklist(i.id);n.append($(`div`,{class:`section`},$(`h3`,{text:`Items for this quest`}),$(`ul`,{class:`checklist`},...r.map(e=>$(`li`,{},$(`span`,{class:`state${e.used?` done`:``}`,text:e.used?`Used`:e.collected?`Collected`:`Needed`}),$(`img`,{src:Gd(e.item.icon,2),alt:``,width:28,height:28,class:`px-icon`}),$(`span`,{},$(`strong`,{text:`${e.item.name}. `}),e.used?`${e.usedIn}.`:e.item.purpose))))))}let o=[...e.allChapters()].reverse().find(t=>e.progress(t.id).stage===`complete`),s=r.stage===`complete`?i:r.stage===`available`?o:void 0;s&&n.append($(`div`,{class:`section`},$(`h3`,{text:s===i?`Chapter reflection`:`Chapter reflection: ${s.title}`}),$(`p`,{style:`margin:0 0 6px`,text:`You earned ${s.rewards.xp} XP and ${s.rewards.seeds} Seeds.${s.rewards.unlock?` Unlocked: ${s.rewards.unlock}.`:``}`}),s.reflection?$(`p`,{style:`margin:0`,text:s.reflection}):null))}t.extraSections().forEach(e=>n.append(e)),t.memories.length&&n.append($(`div`,{class:`section`},$(`h3`,{text:`Memories from Carver's life`}),$(`ul`,{class:`checklist`},...t.memories.map(e=>$(`li`,{style:`align-items:center;justify-content:space-between`},$(`span`,{},$(`strong`,{text:e.title}),` (${e.setting})`),$(`button`,{class:`btn small`,type:`button`,text:`View again`,"aria-label":`View again: ${e.title}`,onclick:()=>t.openMemory(e.id)}))))));let a=Object.entries(t.save.learner).flatMap(([,e])=>e.evidence).slice(-6);return a.length&&n.append($(`div`,{class:`section`},$(`h3`,{text:`Your science notes`}),$(`ul`,{},...a.map(e=>$(`li`,{text:e}))))),n}function f(){let e=$(`div`),n=t.save.progress.inventory;e.append($(`p`,{style:`margin:0 0 12px`,text:`Quest items people have given you. They can never be lost or sold. Choose one to look at it closely.`}));let r=$(`div`,{class:`slots`,role:`list`}),i=$(`div`,{"aria-live":`polite`}),a=e=>{let n=t.engine.itemDef(e),a=t.engine.inventoryEntry(e);if(!n||!a)return;t.onInspect(e),r.querySelectorAll(`.slot`).forEach(t=>t.setAttribute(`aria-pressed`,String(t.dataset.item===e)));let o=Gc(a.from)?.name??a.from;i.replaceChildren($(`div`,{class:`inspect`},$(`img`,{src:Gd(n.icon,6),alt:``,width:96,height:96,class:`px-icon`}),$(`div`,{},$(`h3`,{text:n.name}),$(`p`,{style:`margin:0 0 8px`,text:n.description}),$(`strong`,{text:`Looking closely, you notice:`}),$(`ul`,{style:`margin:4px 0 0;padding-left:22px;line-height:1.45`},...n.lookCloser.map(e=>$(`li`,{text:e}))),$(`dl`,{},$(`dt`,{text:`From`}),$(`dd`,{text:o}),$(`dt`,{text:`Purpose`}),$(`dd`,{text:n.purpose}),$(`dt`,{text:`Status`}),$(`dd`,{text:a.used?`Used: ${a.usedIn}`:`Not used yet`})))))};n.forEach(e=>{let n=t.engine.itemDef(e.itemId);n&&r.append($(`button`,{class:`slot`,type:`button`,role:`listitem`,"data-item":e.itemId,"aria-pressed":`false`,onclick:()=>a(e.itemId)},$(`img`,{src:Gd(n.icon,3),alt:``,width:48,height:48,class:`px-icon`}),$(`span`,{text:n.name}),e.used?$(`span`,{class:`badge`,text:`Used`}):e.inspected?null:$(`span`,{class:`badge`,text:`New`})))});let o=Math.max(3,6-n.length);for(let e=0;e<o;e++)r.append($(`div`,{class:`slot empty`,role:`listitem`,"aria-label":`Empty slot`,text:`Empty`}));e.append(r,i);let s=n.find(e=>!e.inspected)??n[0];return s&&a(s.itemId),e}function p(){let e=$(`div`),{w:n,hgt:r}={w:t.mapSize.w,hgt:t.mapSize.h},i=document.createElement(`canvas`);i.width=t.mapCanvas.width/2,i.height=t.mapCanvas.height/2;let a=i.getContext(`2d`);a.imageSmoothingEnabled=!1,a.drawImage(t.mapCanvas,0,0,i.width,i.height);let o=i.width/n;t.buildings.forEach(e=>{a.fillStyle=e.roof,a.fillRect(e.x*o,e.y*o,e.w*o,e.d*o),a.strokeStyle=`#2b1d1e`,a.lineWidth=2,a.strokeRect(e.x*o+1,e.y*o+1,e.w*o-2,e.d*o-2)}),i.className=`minimap`,i.setAttribute(`role`,`img`);let s=t.playerPos(),c=$(`div`,{class:`minimap-wrap`},i),l=(e,t,i,a,o)=>{c.append($(`div`,{class:`map-pin ${a}`,style:`left:${e/n*100}%;top:${t/r*100}%`},o?Kd(o,``,16):null,i))},u=t.engine.nextAction();Wc.filter(e=>e.required).forEach(e=>l(e.pos.x,e.pos.y-.4,e.id===`carver`?`Carver`:e.name.split(` `)[0],e.id===`carver`?`carver`:``,u.targetNpcId===e.id?`leaf`:void 0));let d=s.scene===`hub`?s:{x:5.5,y:17.5};l(d.x,d.y-.4,s.scene===`hub`?`You`:`You (inside)`,`you`);let f=t.buildings.map(e=>e.label).join(`, `);i.setAttribute(`aria-label`,`Map of Sweetgum Hollow showing ${f}, where you are, and where Carver is.`),e.append($(`div`,{class:`section`},$(`h3`,{text:`Sweetgum Hollow`}),c)),e.append($(`div`,{class:`section`},$(`p`,{style:`margin:6px 0 0`,text:`Places: ${f}. The pond is south of the town square.`})));let p=t.engine,m=p.currentChapter();return e.append($(`div`,{class:`section`},$(`h3`,{text:`Your journey with Carver`}),$(`ol`,{class:`chapter-path`},...p.allChapters().map(e=>{let t=p.progress(e.id).stage,n=t===`complete`?`done`:m?.id===e.id?`current`:``,r=t===`complete`?`Complete`:e.status===`coming-soon`?p.isUnlocked(e.id)?`Unlocked · arrives in the next update`:`Coming in a later update`:t===`locked`?`Locked`:t===`active`?`In progress`:`Ready to start`;return $(`li`,{class:n},$(`div`,{class:`num`,text:e.number===0?`Practice`:`Chapter ${e.number}`}),$(`strong`,{text:e.title}),$(`div`,{style:`font-size:var(--text-small);color:var(--ink-soft)`,text:e.subtitle}),$(`div`,{style:`margin-top:4px;font-size:var(--text-small);font-weight:700`,text:r}),e.analogActivity&&t!==`locked`?$(`div`,{style:`font-size:var(--text-small)`,text:`Off-screen activity: ${e.analogActivity.title}`}):null)})))),e}function m(){let e=$(`div`),n=new Map;if([...t.save.log].reverse().forEach(e=>{n.has(e.conversationId)||n.set(e.conversationId,{npcId:e.npcId,at:e.at})}),!n.size)return e.append($(`p`,{text:`Conversations you have will be saved here so you can replay them.`})),e;e.append($(`p`,{style:`margin:0 0 12px`,text:`Replay any conversation. Replays never change your progress.`}));let r=$(`ul`,{class:`checklist`});return n.forEach((e,n)=>{let i=zc[n];i&&r.append($(`li`,{style:`align-items:center;justify-content:space-between`},$(`span`,{text:i.title}),$(`button`,{class:`btn small`,type:`button`,text:`Replay`,"aria-label":`Replay: ${i.title}`,onclick:()=>{l.close(),t.replay(n)}})))}),e.append(r),e}function h(){return $(`div`,{class:`about`},$(`h3`,{text:`About this story`}),$(`p`,{text:`George Washington Carver (about 1864 to 1943) was a real scientist and teacher. He studied plants and soil, taught at Tuskegee Institute in Alabama, and helped farmers improve their land.`}),$(`p`,{text:`In this game he appears as a storybook guide. His lines are written for the game; they are not his real words. Sweetgum Hollow and its townspeople are made up. Scenes from Carver's life will always be labeled as memories from history.`}),$(`h3`,{text:`Sources used to check facts`}),$(`ul`,{},...Jd.map(e=>$(`li`,{},$(`a`,{href:e.url,target:`_blank`,rel:`noopener noreferrer`,text:e.title}),` (${e.publisher})`))),$(`h3`,{text:`Your privacy`}),$(`p`,{text:`This game saves your progress only in this browser. It does not ask for your name, does not use accounts, and sends nothing to the internet.`}),$(`h3`,{text:`Credits`}),$(`p`,{text:`Game, pixel art, music and sounds: made for Learning Adventures (original work, drawn and synthesized in code). Built with three.js (MIT license). Fonts: Atkinson Hyperlegible by the Braille Institute and Pixelify Sans (both SIL Open Font License).`}))}return l}function Zd(e,t,n,r,i){let a=$(`div`,{class:`seg`,role:`group`,"aria-labelledby":t}),o=()=>a.querySelectorAll(`button`).forEach(e=>e.setAttribute(`aria-pressed`,String(e.dataset.v===r())));return n.forEach(e=>a.append($(`button`,{type:`button`,"data-v":e.v,text:e.label,onclick:()=>{i(e.v),Q.click(),o()}}))),o(),$(`div`,{class:`setting-row`},$(`span`,{class:`lbl`,id:t,text:e}),a)}function Qd(e,t,n){let r=$(`span`,{style:`min-width:3.5em;text-align:right`,text:`${Math.round(il[n]*100)}%`}),i=$(`input`,{type:`range`,id:t,min:`0`,max:`100`,step:`5`,value:String(Math.round(il[n]*100)),oninput:e=>{let t=Number(e.target.value)/100;al({[n]:t}),r.textContent=`${Math.round(t*100)}%`},onchange:()=>Q.click()});return $(`div`,{class:`setting-row`},$(`label`,{for:t,text:e}),$(`div`,{style:`display:flex;gap:10px;align-items:center`},i,r))}function $d(e,t,n){let r=[{v:`on`,label:`On`},{v:`off`,label:`Off`}],i=$(`div`,{class:`content`},$(`h3`,{text:`Sound`}),Zd(`Sound`,`set-mute`,r,()=>il.muted?`off`:`on`,e=>al({muted:e===`off`})),Qd(`Music volume`,`set-music`,`musicVolume`),Qd(`Effects volume`,`set-sfx`,`sfxVolume`),$(`h3`,{style:`margin-top:14px`,text:`Comfort and reading`}),Zd(`Reduce motion`,`set-motion`,r,()=>il.reducedMotion?`on`:`off`,e=>al({reducedMotion:e===`on`})),Zd(`Text speed`,`set-speed`,[{v:`slow`,label:`Slow`},{v:`normal`,label:`Normal`},{v:`fast`,label:`Fast`},{v:`instant`,label:`Instant`}],()=>il.textSpeed,e=>al({textSpeed:e})),Zd(`Text size`,`set-size`,[{v:`normal`,label:`Normal`},{v:`large`,label:`Large`}],()=>il.textSize,e=>al({textSize:e})),Zd(`Touch controls`,`set-touch`,[{v:`auto`,label:`Auto`},{v:`on`,label:`Show`},{v:`off`,label:`Hide`}],()=>il.touchControls,e=>al({touchControls:e})));t.inGame&&i.append($(`h3`,{style:`margin-top:14px`,text:`World`}),Zd(`Day and night`,`set-time`,[{v:`flow`,label:`Flowing`},{v:`paused`,label:`Paused`}],()=>t.timePaused()?`paused`:`flow`,e=>t.setTimePaused(e===`paused`)),$(`div`,{class:`setting-row`},$(`span`,{class:`lbl`,text:`Your look`}),$(`button`,{class:`btn small`,type:`button`,text:`Change appearance`,onclick:()=>{a.close(),t.changeLook()}})),$(`h3`,{style:`margin-top:14px`,text:`Saving`}),$(`p`,{style:`margin:0 0 6px;font-size:var(--text-small)`,text:`The game saves by itself after each important moment. Saves stay in this browser only.`}),$(`div`,{class:`setting-row`},$(`button`,{class:`btn small`,type:`button`,text:`Save now`,onclick:()=>t.saveNow()}),$(`button`,{class:`btn small`,type:`button`,text:`Download a save file`,onclick:()=>t.exportSave()}),$(`label`,{class:`btn small`,style:`cursor:pointer`,tabindex:`0`,role:`button`,onkeydown:e=>{let t=e.key;(t===`Enter`||t===` `)&&(e.preventDefault(),ef.click())}},`Load a save file`,ef),$(`button`,{class:`btn small danger`,type:`button`,text:`Start over…`,onclick:()=>t.resetSave()}))),i.append($(`div`,{class:`setting-row`},$(`span`,{class:`lbl`,text:`Sources, privacy and credits`}),$(`button`,{class:`btn small`,type:`button`,text:`Open`,onclick:()=>{a.close(),t.about()}})));let a=new Od(e,$(`div`,{class:`panel modal`,role:`dialog`,"aria-modal":`true`,"aria-labelledby":`set-title`,style:`width:min(680px,100%)`},$(`header`,{},$(`h2`,{id:`set-title`,text:`Settings`}),$(`button`,{class:`btn small`,type:`button`,text:`Close (Esc)`,"data-autofocus":!0,onclick:()=>a.close()})),i),n);return a}var ef=(()=>{let e=document.createElement(`input`);return e.type=`file`,e.accept=`.json,application/json,text/plain`,e.hidden=!0,e})();function tf(e){ef.onchange=async()=>{let t=ef.files?.[0];ef.value=``,!(!t||t.size>1e6)&&e(await t.text())}}function nf(e,t){let n=$(`div`,{class:`screen`,role:`main`},$(`div`,{class:`panel title-card`},$(`h1`,{class:`logo`,text:`Seeds of Genius`}),$(`p`,{class:`sub`,text:`George Washington Carver and the Power of Science`}),$(`p`,{class:`intro`},`Move into the little town of Sweetgum Hollow and meet George Washington Carver, a real scientist who appears here as your storybook guide. `,`Help him with quests, talk to your neighbors, and learn to think like a scientist. `,$(`strong`,{text:`His lines are written for this game, and the townspeople are made up.`})),$(`div`,{class:`buttons`},t.hasSave?$(`button`,{class:`btn primary`,type:`button`,text:`Continue`,"data-autofocus":!0,onclick:()=>t.continueGame()}):null,$(`button`,{class:`btn${t.hasSave?``:` primary`}`,type:`button`,text:t.hasSave?`New game`:`Start a new game`,onclick:()=>t.newGame()}),$(`button`,{class:`btn`,type:`button`,text:`Settings`,onclick:()=>t.settings()})),$(`p`,{style:`margin:14px 0 0;font-size:var(--text-small);color:var(--ink-soft)`},`Saves stay in this browser. No accounts, no names, nothing sent online.`)));return e.append(n),requestAnimationFrame(()=>n.querySelector(`.btn`)?.focus()),n}var rf=class{constructor(e,t,n){K(this,`input`,void 0),K(this,`pad`,void 0),K(this,`act`,void 0),K(this,`held`,new Set),K(this,`vx`,0),K(this,`vy`,0),K(this,`shown`,null),this.input=t;let r=(e,t,n,r)=>{let i=$(`button`,{class:e,type:`button`,"aria-label":`Walk ${t}`,text:{up:`▲`,down:`▼`,left:`◀`,right:`▶`}[e]}),a=t=>{t.preventDefault(),this.held.add(e),this.push(n,r,!0);try{i.setPointerCapture(t.pointerId)}catch{}},o=t=>{t.preventDefault(),this.held.delete(e),this.push(n,r,!1)};return i.addEventListener(`pointerdown`,a),i.addEventListener(`pointerup`,o),i.addEventListener(`pointercancel`,o),i.addEventListener(`lostpointercapture`,o),i};this.pad=$(`div`,{class:`touch`,role:`group`,"aria-label":`Movement pad`},r(`up`,`up`,0,-1),r(`left`,`left`,-1,0),r(`right`,`right`,1,0),r(`down`,`down`,0,1)),this.act=$(`button`,{class:`btn primary touch-act`,type:`button`,text:`Talk`,onclick:()=>n()}),e.append(this.pad,this.act)}push(e,t,n){let r=n?1:-1;this.vx=Math.max(-1,Math.min(1,this.vx+e*r)),this.vy=Math.max(-1,Math.min(1,this.vy+t*r)),this.held.size||(this.vx=0,this.vy=0),this.input.setVirtual(this.vx,this.vy)}setVisible(e){e!==this.shown&&(this.shown=e,e||(this.held.clear(),this.input.setVirtual(0,0)),this.pad.style.display=e?``:`none`,this.act.style.display=e?``:`none`)}setActLabel(e){this.act.textContent=e??`Act`,this.act.disabled=!e}};function af(e,t){if(e.querySelector(`.debug`))return;let n=(e,t)=>$(`button`,{class:`btn`,type:`button`,text:e,onclick:t}),r=$(`div`,{style:`display:none;flex-direction:column;gap:4px`},n(`Morning`,()=>t.setTime(420)),n(`Noon`,()=>t.setTime(720)),n(`Evening`,()=>t.setTime(1125)),n(`Night`,()=>t.setTime(1320)),n(`Go: Carver`,()=>t.teleport(21.5,9.3)),n(`Go: Mae`,()=>t.teleport(32.5,19.6)),n(`Go: Cottage`,()=>t.teleport(5.5,18.5)),n(`Go: Room`,()=>t.teleport(5,6,`room`)),n(`Finish practice`,()=>t.debugComplete()),...Lc.filter(e=>e.number>0).map(e=>n(`Chapter ${e.number}`,()=>{e.status===`playable`?(t.debugJumpTo(e.number),Y.emit(`toast`,{text:`Chapter ${e.number} is ready: talk to Carver.`,kind:`info`})):Y.emit(`toast`,{text:`Chapter ${e.number} is not built yet (Phase ${e.number}).`,kind:`info`})})),n(`Reset test save`,()=>{localStorage.removeItem(`seedsOfGenius.save`),localStorage.removeItem(`seedsOfGenius.save.backup`),location.reload()})),i=$(`button`,{class:`btn`,type:`button`,text:`Debug`,"aria-expanded":`false`,onclick:()=>{let e=r.style.display===`none`;r.style.display=e?`flex`:`none`,i.setAttribute(`aria-expanded`,String(e))}}),a=$(`div`,{class:`panel debug`,"aria-label":`Debug menu`},i,r);e.append(a)}var of={childhood:{id:`childhood`,title:`The Plant Doctor`,setting:`Diamond, Missouri, in the 1870s`,pages:[{art:`farm`,caption:`George was born into slavery around 1864, near Diamond, Missouri. After slavery ended, he and his brother Jim were raised by Moses and Susan Carver on their farm.`},{art:`woods`,caption:`George was often sick as a boy, so he helped with chores in the house and garden. In his free time he explored the woods, looking closely at plants, insects and rocks.`},{art:`doctor`,caption:`He kept a small garden of his own. Neighbors brought him plants that were not doing well, and he helped many grow strong again. People called him the 'plant doctor.'`}]},tuskegee_soil:{id:`tuskegee_soil`,title:`Tired Cotton Fields`,setting:`Tuskegee Institute, Alabama, from 1896`,pages:[{art:`mem-station`,caption:`At Tuskegee Institute, Carver worked with farmers whose soil had grown cotton year after year. Cotton had worn much of the soil out. He used test plots to try ways to make it healthy again.`},{art:`mem-bulletin`,caption:`He taught farmers to take turns: plant cotton one season, then legumes such as peanuts or peas, which put nitrogen back into the soil. He also wrote short booklets in plain words so farmers could try these ideas at home.`}]}};function sf(e,t){let n=of[t];return n?(Q.open(),new Promise(t=>{let r=0,i=document.createElement(`canvas`);i.width=96,i.height=64,i.className=`painting memory-painting`,i.setAttribute(`role`,`img`);let a=$(`p`,{class:`memory-caption`,"aria-live":`polite`}),o=$(`span`,{class:`memory-count`}),s=$(`button`,{class:`btn small`,type:`button`,text:`Back`,onclick:()=>u(-1)}),c=$(`button`,{class:`btn small primary`,type:`button`,"data-autofocus":!0,onclick:()=>u(1)}),l=()=>{let e=n.pages[r],t=i.getContext(`2d`);t.clearRect(0,0,96,64),t.drawImage(ud(e.art),0,0),i.setAttribute(`aria-label`,`Illustration, page ${r+1}: ${e.caption}`),a.textContent=e.caption,o.textContent=`Page ${r+1} of ${n.pages.length}`,s.disabled=r===0,c.textContent=r===n.pages.length-1?`Close the memory`:`Next page`},u=e=>{if(r+e>=n.pages.length)return d.close();r=Math.max(0,r+e),Q.click(),l(),c.focus()},d=new Od(e,$(`div`,{class:`panel modal memory-modal`,role:`dialog`,"aria-modal":`true`,"aria-labelledby":`mem-title`},$(`header`,{},$(`div`,{},$(`span`,{class:`badge history`,text:`A memory from Carver's life`}),$(`h2`,{id:`mem-title`,text:n.title}),$(`p`,{class:`memory-setting`,text:n.setting})),$(`button`,{class:`btn small`,type:`button`,text:`Close`,onclick:()=>d.close()})),$(`div`,{class:`content`},i,a,$(`div`,{class:`memory-nav`},s,o,c),$(`p`,{class:`small memory-note`,text:`The pictures are imagined. The facts come from the National Park Service.`}))),()=>{Q.close(),t()});l()})):Promise.resolve()}function cf(e){let t=new q(11,11),n=`#ffd35e`,r=`#fffbe8`,i=e===0?4:3;for(let e=-i;e<=i;e++)t.set(5+e,5,Math.abs(e)<2?r:n),t.set(5,5+e,Math.abs(e)<2?r:n);return e===1&&(t.set(3,3,n),t.set(7,3,n),t.set(3,7,n),t.set(7,7,n)),t.set(5,5,r),t.outline(`#8a5a0e`)}var lf=4.2,uf=6.4,df=.28,ff=.85,pf=class{constructor(e){K(this,`host`,void 0),K(this,`renderer`,void 0),K(this,`input`,new vl),K(this,`store`,new zl),K(this,`save`,Sl()),K(this,`engine`,void 0),K(this,`hub`,void 0),K(this,`room`,void 0),K(this,`school`,void 0),K(this,`farm`,void 0),K(this,`world`,void 0),K(this,`player`,void 0),K(this,`npcActors`,new Map),K(this,`hud`,void 0),K(this,`dialogue`,void 0),K(this,`touch`,void 0),K(this,`uiLayer`,void 0),K(this,`modal`,null),K(this,`running`,!1),K(this,`title`,null),K(this,`last`,performance.now()),K(this,`clock`,0),K(this,`path`,null),K(this,`pathGoal`,null),K(this,`target`,null),K(this,`guideUntil`,0),K(this,`autosaveTimer`,0),K(this,`stepSoundCooldown`,0),K(this,`transitioning`,!1),K(this,`movedDistance`,0),K(this,`hubGroundCanvas`,void 0),K(this,`debug`,void 0),K(this,`lanternState`,new Map),K(this,`talkingTo`,null),K(this,`runtimes`,new Map),K(this,`loadingRuntimes`,new Set),K(this,`sparkles`,new Map),K(this,`sparkleTex`,[]),K(this,`sparkleWorld`,null),this.host=e,ol(),this.renderer=new Qc(e),this.hub=gd(),this.room=yd(),this.school=xd(),this.farm=Cd(),this.world=this.hub,this.hubGroundCanvas=Ac(this.hub.map),this.uiLayer=$(`div`,{class:`ui-layer`}),e.append(this.uiLayer),this.debug=new URLSearchParams(location.search).has(`debug`)||!1,window.addEventListener(`resize`,()=>this.renderer.resize()),document.addEventListener(`visibilitychange`,()=>{document.hidden&&this.running&&this.persist(`quiet`)}),window.addEventListener(`pagehide`,()=>this.running&&this.persist(`quiet`)),this.renderer.canvas.addEventListener(`pointerdown`,e=>this.onPointer(e)),this.input.onAction(e=>this.onAction(e)),tf(e=>this.importSave(e)),this.wireEvents(),this.exposeTestHooks()}start(){this.renderer.setBounds(this.hub.map.w,this.hub.map.h),this.renderer.lookAt(20,14),requestAnimationFrame(e=>this.frame(e)),this.showTitle()}showTitle(){this.title=nf(this.uiLayer,{hasSave:this.store.hasSave(),continueGame:()=>{Q.unlock(),this.beginFromStore()},newGame:async()=>{if(Q.unlock(),this.store.hasSave()){if(await kd(this.uiLayer,`Start a new game?`,`This will replace the progress saved in this browser. You can download a save file first from Settings.`,[{id:`yes`,label:`Yes, start over`,kind:`danger`},{id:`no`,label:`No, go back`}])!==`yes`)return;this.store.reset()}this.beginNew()},settings:()=>{Q.unlock(),$d(this.uiLayer,this.settingsActions(!1))}}),Q.setMood(`title`)}closeTitle(){this.title?.remove(),this.title=null}beginFromStore(){let e=this.store.load();this.closeTitle(),this.enterGame(e.data),e.status===`recovered`&&Y.emit(`save:status`,{status:`recovered`,message:`Save restored from backup`}),e.status===`recovered`&&Y.emit(`toast`,{text:`Your last save was damaged, so the backup copy was restored.`,kind:`info`}),e.status===`unreadable`&&Y.emit(`toast`,{text:`We couldn't read the old save. It was set aside safely, and a new game has started.`,kind:`info`})}beginNew(){this.closeTitle();let e=Sl();this.enterGame(e),this.openCustomizer(!0)}enterGame(e){this.save=e,this.engine=new Jc(Lc,Vc,this.save.progress,Y);let t=ec(this.save.appearance);this.player?this.player.setLook(t):(this.player=new bu(this.hub.lighting,t,e.world.x,e.world.y,e.world.facing),this.player.onStep(()=>{this.stepSoundCooldown<=0&&(Q.step(),this.stepSoundCooldown=.25)})),this.spawnNpcs(),this.setScene(e.world.scene,{x:e.world.x,y:e.world.y},e.world.facing),this.hud??(this.hud=new qd(this.uiLayer,{journal:()=>this.openJournal(`quest`),bag:()=>this.openJournal(`bag`),menu:()=>this.openSettingsPanel(),toggleMute:()=>this.toggleMute(),interact:()=>this.interact()}));let n=this;this.dialogue??(this.dialogue=new Hd(this.uiLayer,{apply:e=>e.type===`showMemory`?this.showMemory(e.memoryId):this.applyEffect(e),resolve:e=>this.resolveTokens(e),get learner(){return n.save.learner},onLearningChanged:()=>this.persist(`quiet`)})),this.touch??(this.touch=new rf(this.uiLayer,this.input,()=>this.interact())),this.debug&&af(this.uiLayer,this),this.hud.setVisible(!0),this.ensureRuntimes(),this.refreshHud(),this.running=!0,this.input.worldActive=!0,this.updateMood()}spawnNpcs(){if(!this.npcActors.size){for(let e of Wc){let t=new bu(this.hub.lighting,e.look,e.pos.x,e.pos.y,e.facing);t.group.name=`npc:${e.id}`,this.npcActors.set(e.id,t),this.hub.scene.add(t.group)}this.refreshNpcPresence(!0)}}refreshNpcPresence(e=!1){let t=this.save.time.minutes,n=ml(t).night>.5;this.hub.grid.clearDynamic();for(let r of Wc){let i=this.npcActors.get(r.id),a=gl(r.presence,t);i.setVisible(a),a&&(this.hub.grid.setDynamic(r.id,[[Math.floor(r.pos.x),Math.floor(r.pos.y)]]),this.hub.grid.setBlocker(r.id,r.pos.x,r.pos.y,ff));let o=!!r.lanternAtNight&&n;(e||this.lanternState.get(r.id)!==o)&&(this.lanternState.set(r.id,o),i.setLook({...r.look,extras:{...r.look.extras,lantern:o}}))}}sceneById(e){return{hub:this.hub,room:this.room,school:this.school,farm:this.farm}[e]}setScene(e,t,n=`down`){this.world=this.sceneById(e);let r=t??this.world.map.spawn,i=this.world.grid.isFree(r.x,r.y,df);this.player.x=i?r.x:this.world.map.spawn.x,this.player.y=i?r.y:this.world.map.spawn.y,this.player.facing=n,this.world.scene.add(this.player.group),this.world.lighting.add(this.player.material),this.renderer.setBounds(this.world.map.w,this.world.map.h),this.renderer.lookAt(this.player.x,this.player.y),this.room.setPotPlanted?.(this.engine?.progress(`practice`).stage===`complete`),this.path=null,this.pathGoal=null,Y.emit(`scene:changed`,{scene:e})}async transition(e){if(this.transitioning)return;this.transitioning=!0,Q.door(),this.input.clear();let t=il.reducedMotion?0:280;this.hud.fade.classList.add(`on`),await mf(t);let n=this.world;e===`hub`?this.setScene(`hub`,n.map.exit?.at??this.hub.map.spawn,`down`):this.setScene(e,this.sceneById(e).map.entry,`up`),this.persist(`quiet`),this.hud.fade.classList.remove(`on`),await mf(t),this.transitioning=!1,e===`room`&&this.markTip(`rest`)}frame(e){let t=Math.min(.05,(e-this.last)/1e3);this.last=e,this.clock+=t;try{this.update(t)}catch(e){console.error(`[game] update failed`,e)}this.renderer.render(this.world.scene),requestAnimationFrame(e=>this.frame(e))}get blocked(){return!this.running||this.dialogue?.isOpen||!!this.modal||this.transitioning||!!this.title}update(e){let t=il.reducedMotion;if(!this.running){let n=t?0:this.clock*.25;this.renderer.lookAt(20+Math.sin(n*.3)*8,14+Math.cos(n*.2)*3),this.applyLight(540),this.hub.update(e,this.clock,0,t);return}!this.save.time.paused&&!this.blocked&&(this.save.time.minutes+=e/fl,this.save.time.minutes>=1440&&(this.save.time.minutes-=1440,this.save.time.day+=1));let n=this.applyLight(this.save.time.minutes);this.world.update(e,this.clock,n.night,t),Math.floor(this.clock*2)!==Math.floor((this.clock-e)*2)&&(this.refreshNpcPresence(),this.updateMood()),this.stepSoundCooldown-=e,this.movePlayer(e),this.player.update(e,t),this.npcActors.forEach((n,r)=>{if(this.world!==this.hub)return;let i=Gc(r);n.facing=Math.hypot(n.x-this.player.x,n.y-this.player.y)<2.6?hf(n.x,n.y,this.player.x,this.player.y):i.facing,n.setMarker(this.engine.markerFor(r)),n.update(e,t)}),this.renderer.lookAt(...this.cameraFocus(),t?0:.18),this.findTarget(),this.updateSparkles(),this.updatePromptAndArrow(),this.updateTips(),this.autosaveTimer+=e,this.autosaveTimer>30&&!this.blocked&&this.persist(`quiet`)}cameraFocus(){let e=this.player,t=this.talkingTo?Gc(this.talkingTo):null,n=this.uiLayer.querySelector(`.dialogue`);if(!t||!n||this.world!==this.hub)return[e.x,e.y];let r=window.devicePixelRatio||1,i=16*this.renderer.scale/r;return[(e.x+t.pos.x)/2,(e.y+t.pos.y)/2-.6+n.offsetHeight/2/i]}applyLight(e){let t=ml(e);if(this.world.interior){let e=[1,.9,.78],n=t.night*.7,r=t.tint.map((t,r)=>t*(1-n)+e[r]*n);this.world.lighting.set(r,t.night)}else this.world.lighting.set(t.tint,t.night);return this.hud&&this.running&&(this.hud.setClock(e,this.world.interior?0:t.night,this.save.time.paused),this.hud.vignette.style.opacity=String(this.world.interior?0:t.night*.85)),t}updateMood(){let e=ml(this.save.time.minutes).night>.5;Q.setMood(e?`night`:`day`),Q.setNightAmbience(e&&this.world===this.hub)}movePlayer(e){let t=this.player,n=this.blocked?{x:0,y:0}:this.input.direction();if(n.x||n.y)this.path=null,this.pathGoal=null;else if(this.path&&!this.blocked){let e=this.pathGoal;if(e&&e.kind===`npc`&&Math.hypot(e.x-t.x,e.y-t.y)<1.5){this.path=null,this.pathGoal=null,t.moving=!1,t.facing=hf(t.x,t.y,e.x,e.y),this.findTarget(),this.target&&_f(this.target,e)&&this.interact();return}let r=this.path[0],i=r.x-t.x,a=r.y-t.y,o=Math.hypot(i,a);if(o<.12){if(this.path.shift(),!this.path.length){this.path=null;let e=this.pathGoal;this.pathGoal=null,e&&(t.facing=hf(t.x,t.y,e.x,e.y),this.findTarget(),this.target&&_f(this.target,e)&&this.interact())}}else n={x:i/o,y:a/o}}let r=this.input.run?uf:lf;if(n.x||n.y){let i=this.world.grid.move(t.x,t.y,n.x*r*e,n.y*r*e,df),a=Math.hypot(i.x-t.x,i.y-t.y);this.movedDistance+=a,t.x=i.x,t.y=i.y,t.moving=a>5e-4,t.facing=Math.abs(n.x)>Math.abs(n.y)?n.x>0?`right`:`left`:n.y>0?`down`:`up`,!t.moving&&this.path&&(this.path=null)}else t.moving=!1;let i=this.world.map.exit;i&&t.y>i.y&&t.x>=i.x0&&t.x<=i.x1&&!this.transitioning&&this.transition(i.to)}onPointer(e){if(this.blocked)return;Q.unlock();let t=this.host.getBoundingClientRect(),n=e.clientX-t.left,r=e.clientY-t.top;for(let[e,t]of this.npcActors){if(this.world!==this.hub||!t.group.visible)continue;let i=this.renderer.project(new z(t.group.position.x,0,t.group.position.z)),a=this.renderer.project(t.headPoint()),o=this.renderer.scale*10/(window.devicePixelRatio||1);if(n>i.x-o&&n<i.x+o&&r<i.y+4&&r>a.y-6){let t=Gc(e);this.walkTo({kind:`npc`,id:e,label:`Talk to ${vf(t)}`,x:t.pos.x,y:t.pos.y});return}}let i=this.renderer.screenToTile(n,r);if(!i)return;let a=this.targetsInScene().find(e=>e.kind!==`npc`&&Math.hypot(e.x-i.x,e.y-i.y)<.9);if(a)return this.walkTo(a);this.walkTo(null,i)}walkTo(e,t){let n=e?{x:e.x,y:e.y}:t,r=wu(this.world.grid,this.player,n);r&&(this.path=r.length?r:null,this.pathGoal=e,!r.length&&e&&(this.findTarget(),this.target&&_f(this.target,e)&&this.interact()))}targetsInScene(){let e=[];if(this.world===this.hub){for(let t of Wc)gl(t.presence,this.save.time.minutes)&&e.push({kind:`npc`,id:t.id,label:`Talk to ${vf(t)}`,x:t.pos.x,y:t.pos.y});for(let t of this.hub.map.props)t.kind===`sign`&&t.text&&e.push({kind:`sign`,text:t.text,label:`Read the sign`,x:t.x+.5,y:t.y+.5})}for(let t of this.world.map.places)e.push({kind:`place`,id:t.id,label:t.label,x:t.x,y:t.y});for(let[t,n]of this.runtimePlaces())(n.scene??`hub`)===this.world.id&&e.push({kind:`rplace`,id:n.id,chapterId:t,label:n.label,x:n.x,y:n.y,radius:n.radius});return e}findTarget(){if(this.blocked)return;let e=this.player,t=null,n=1/0;for(let r of this.targetsInScene()){let i=Math.hypot(r.x-e.x,r.y-e.y),a=r.kind===`npc`?1.7:r.kind===`sign`?1.35:r.kind===`rplace`?r.radius:this.world.map.places.find(e=>e.id===r.id)?.radius??1,o=i-gf(e.facing,r.x-e.x,r.y-e.y)*.35;i<=a&&o<n&&(t=r,n=o)}this.target=t}interact(){if(this.blocked)return;Q.unlock();let e=this.target;e&&(this.path=null,e.kind===`npc`?this.talkTo(e.id):e.kind===`sign`?this.say(e.text):e.kind===`rplace`?this.useRuntimePlace(e.chapterId,e.id):this.usePlace(e.id))}ensureRuntimes(){for(let e of this.engine.allChapters())!e.loadRuntime||this.runtimes.has(e.id)||this.loadingRuntimes.has(e.id)||this.engine.progress(e.id).stage!==`locked`&&(this.loadingRuntimes.add(e.id),e.loadRuntime().then(t=>{this.runtimes.set(e.id,t.default),this.refreshHud()}).catch(t=>{console.error(`[game] could not load chapter ${e.id}`,t),Y.emit(`toast`,{text:`Part of this chapter did not load. Please reload the page.`,kind:`info`})}).finally(()=>this.loadingRuntimes.delete(e.id)))}get runtimesReady(){return this.loadingRuntimes.size===0}runtimeContext(e){var t;let n=(t=this.save.chapterData)[e]??(t[e]={});return{host:this.uiLayer,engine:this.engine,save:this.save,data:n,learner:this.save.learner,apply:e=>void this.applyEffect(e),persist:()=>this.persist(`quiet`),toast:(e,t)=>Y.emit(`toast`,{text:e,kind:t}),say:async e=>{let t={};e.forEach((n,r)=>t[`n${r}`]={id:`n${r}`,speaker:n.speaker,expression:n.expression,text:n.text,next:r+1<e.length?`n${r+1}`:null}),await this.dialogue.run({id:`runtime`,title:``,start:`n0`,nodes:t},{replay:!0})},grantBonus:(e,t,n)=>{var r;let i=(r=this.save.chapterData).__bonus??(r.__bonus={});return!i[e]&&(i[e]=!0,this.save.progress.seeds+=t,this.save.progress.xp+=n,Q.itemGet(),this.refreshHud(),!0)},sound:e=>{e===`correct`?Q.correct():e===`retry`?Q.retry():e===`item`?Q.itemGet():e===`open`?Q.open():e===`close`?Q.close():Q.questComplete()}}}*runtimePlaces(){for(let[e,t]of this.runtimes)for(let n of t.places(this.runtimeContext(e)))yield[e,n]}async useRuntimePlace(e,t){let n=this.runtimes.get(e);n&&(await this.withModalGuard(()=>n.usePlace(t,this.runtimeContext(e))),this.persist(),this.refreshHud())}resolveTokens(e){if(!e.includes(`{`))return e;let t={};for(let[e,n]of this.runtimes)Object.assign(t,n.tokens(this.runtimeContext(e)));return e.replace(/\{(\w+)\}/g,(e,n)=>t[n]??e)}async showMemory(e){this.save.memories.includes(e)||this.save.memories.push(e),await sf(this.uiLayer,e),this.persist(`quiet`)}objective(){let e=this.engine.nextAction();if(e.targetPlaceId){let e=this.engine.currentChapter(),t=(e?this.runtimes.get(e.id):void 0)?.objective?.(this.runtimeContext(e.id));if(t)return{text:t.text,point:{x:t.x,y:t.y,label:t.label??`Garden`,scene:t.scene??`hub`}}}return{text:e.text,npc:e.targetNpcId}}updateSparkles(){this.sparkleTex.length||(this.sparkleTex=[0,1].map(e=>du(cf(e).toCanvas()))),this.sparkleWorld!==this.world&&(this.sparkles.forEach(e=>this.sparkleWorld?.scene.remove(e)),this.sparkles.clear(),this.sparkleWorld=this.world);let e=new Set;for(let[,t]of this.runtimePlaces()){if(!t.marker||(t.scene??`hub`)!==this.world.id)continue;let n=Math.hypot(t.x-this.player.x,t.y-this.player.y)<3.2;if(t.marker===`faint`&&!n)continue;e.add(t.id);let r=this.sparkles.get(t.id);if(!r){let e=new Jn({map:this.sparkleTex[0],transparent:!0,depthWrite:!1});r=new xr(new ii(11/16,11/16),e),r.rotation.x=-Math.PI/4,r.renderOrder=15,this.world.scene.add(r),this.sparkles.set(t.id,r)}let i=r.material,a=il.reducedMotion?0:Math.floor(this.clock*2.5+t.x)%2;i.map!==this.sparkleTex[a]&&(i.map=this.sparkleTex[a],i.needsUpdate=!0),i.opacity=t.marker===`faint`?.55:1;let o=il.reducedMotion?0:Math.sin(this.clock*3+t.x)*.06;r.position.set(t.x,(.9+o)*Z,t.y*Z+.05)}for(let[t,n]of this.sparkles)e.has(t)||(this.world.scene.remove(n),this.sparkles.delete(t))}async talkTo(e){let t=Gc(e);if(!t)return;this.player.facing=hf(this.player.x,this.player.y,t.pos.x,t.pos.y);let n=zc[this.engine.conversationFor(e)??this.ambientFor(t)];if(n){this.markTip(`talk`),this.markTip(`findCarver`),this.talkingTo=e;try{await this.runConversation(n,e)}finally{this.talkingTo=null}}}ambientFor(e){let t=hl(this.save.time.minutes);return e.ambient[t]??e.ambient.default}async runConversation(e,t,n=!1){this.input.clear(),this.input.worldActive=!1,this.hud.setPrompt(null),Y.emit(`dialogue:started`,{conversationId:e.id});try{await this.dialogue.run(e,{replay:n})}finally{this.input.worldActive=!0,Y.emit(`dialogue:ended`,{conversationId:e.id})}n||(this.save.log.push({conversationId:e.id,npcId:t,at:Date.now()}),this.save.log.length>200&&this.save.log.shift(),this.persist()),this.refreshHud()}async say(e){let t={id:`narrator`,title:``,start:`n`,nodes:{n:{id:`n`,speaker:`narrator`,text:e,next:null}}};this.input.clear(),this.input.worldActive=!1;try{await this.dialogue.run(t,{replay:!0})}finally{this.input.worldActive=!0}}async usePlace(e){switch(e){case`cottage_door`:return this.transition(`room`);case`room_door`:case`school_exit`:case`farm_exit`:return this.transition(`hub`);case`farm_door`:{let e=this.engine.progress(`ch3`).stage;return e===`active`||e===`complete`?this.transition(`farm`):e===`available`?this.say(`The farm gate is latched. Carver has a question about this farm for you first.`):this.say(Bc.farm_door)}case`school_door`:{let e=this.engine.progress(`ch2`).stage;return e===`active`||e===`complete`?this.transition(`school`):e===`available`?this.say(`The schoolhouse is closed. Carver has something to tell you about school first.`):this.say(Bc.school_door)}case`bed`:return this.rest();case`wardrobe`:return this.openCustomizer(!1);case`windowsill`:return this.say(this.engine.progress(`practice`).stage===`complete`?Bc.windowsill_planted:Bc.windowsill_empty);default:if(Bc[e])return this.say(Bc[e])}}async rest(){let e=await this.withModalGuard(()=>kd(this.uiLayer,`Rest in bed`,`Resting moves time forward. Lessons never need a certain time of day.`,[{id:`morning`,label:`Sleep until morning`},{id:`evening`,label:`Nap until evening`},{id:`night`,label:`Rest until nighttime`},{id:`cancel`,label:`Not now`}]));if(e!==`morning`&&e!==`evening`&&e!==`night`)return;this.transitioning=!0,this.hud.fade.classList.add(`on`),Q.rest(),await mf(il.reducedMotion?150:900);let t=this.save.time,n={morning:420,evening:1080,night:1260}[e];t.minutes>=n&&(t.day+=1),t.minutes=n,this.refreshNpcPresence(),this.updateMood(),this.persist(),this.hud.fade.classList.remove(`on`),this.transitioning=!1;let r={morning:`You feel rested. Good morning!`,evening:`A cozy nap. The evening lamps are coming on.`,night:`The stars are out, and the lamps are glowing.`}[e];Y.emit(`toast`,{text:r,kind:`info`})}applyEffect(e){if(this.engine.apply(e),e.type===`acceptQuest`){Q.questAccept();let t=this.engine.getChapter(e.chapterId);Y.emit(`toast`,{text:`New quest from Carver: ${t?.title??``}`,kind:`reward`}),this.markTipPending(`journal`)}e.type===`useItem`&&Y.emit(`toast`,{text:`${Vc[e.itemId]?.name??`Item`}: ${e.usedIn}`,kind:`item`}),this.refreshHud(),this.persist()}wireEvents(){Y.on(`item:granted`,({itemId:e,from:t})=>{Q.itemGet();let n=Gc(t)?.name??t;Y.emit(`toast`,{text:`New item: ${Vc[e]?.name} (from ${n})`,kind:`item`}),this.markTipPending(`bag`)}),Y.on(`chapter:completed`,({chapterId:e,xp:t,seeds:n})=>{Q.questComplete();let r=this.engine.getChapter(e);Y.emit(`toast`,{text:`Quest complete: ${r?.title}! +${t} XP, +${n} Seeds`,kind:`reward`}),r?.rewards.unlock&&Y.emit(`toast`,{text:`Unlocked: ${r.rewards.unlock}`,kind:`reward`}),e===`practice`&&(this.room.setPotPlanted?.(!0),this.markTipPending(`rest`))}),Y.on(`quest:changed`,()=>{this.ensureRuntimes(),this.refreshHud()}),Y.on(`settings:changed`,()=>this.touch?.setVisible(cl()&&this.running))}refreshHud(){this.hud&&this.engine&&(this.hud.setObjective(this.objective().text),this.hud.setStats(this.save.progress.xp,this.save.progress.seeds),this.touch?.setVisible(cl()))}updatePromptAndArrow(){if(this.touch.setVisible(cl()&&!this.blocked),this.blocked){this.hud.setPrompt(null),this.hud.setArrow(null),this.touch.setActLabel(null);return}let e=this.target;if(e){let t=e.kind===`npc`?this.npcActors.get(e.id):null,n=t?t.headPoint().add(new z(0,.35,0)):new z(e.x,1.4*Z,e.y*Z),r=this.renderer.project(n);this.hud.setPrompt(e.label,r.x,r.y),this.touch.setActLabel(e.kind===`npc`?`Talk`:e.kind===`sign`?`Read`:`Use`)}else this.hud.setPrompt(null),this.touch.setActLabel(null);let t=this.objective(),n=t.npc;this.clock<this.guideUntil&&(n=`carver`);let r=this.renderer.project(this.player.headPoint()),i=this.world.map.exit,a=t.point&&t.point.scene===this.world.id;if(i&&(n||t.point&&!a)){let e=this.renderer.project(new z((i.x0+i.x1)/2,0,(i.y+.5)*Z));this.hud.setArrow(e.visible?null:`Door`,r.x,r.y,e.x,e.y);return}if(t.point&&!a&&this.world===this.hub){let e=this.hub.map.places.find(e=>e.id===`${t.point.scene}_door`);e&&(t.point={x:e.x,y:e.y,label:t.point.label,scene:`hub`})}let o=n?this.npcActors.get(n):null;if(o&&this.world===this.hub){let e=this.renderer.project(o.headPoint()),{w:t,h:i}=this.renderer.hostSize,a=e.x>40&&e.x<t-40&&e.y>60&&e.y<i-60;this.hud.setArrow(a?null:vf(Gc(n)),r.x,r.y,e.x,e.y)}else if(t.point&&t.point.scene===this.world.id){let e=this.renderer.project(new z(t.point.x,.8*Z,t.point.y*Z)),{w:n,h:i}=this.renderer.hostSize,a=e.x>40&&e.x<n-40&&e.y>60&&e.y<i-60;this.hud.setArrow(a?null:t.point.label,r.x,r.y,e.x,e.y)}else this.hud.setArrow(null)}markTipPending(e){!this.save.tips.includes(`pending:${e}`)&&!this.save.tips.includes(e)&&this.save.tips.push(`pending:${e}`)}markTip(e){this.save.tips=this.save.tips.filter(t=>t!==`pending:${e}`),this.save.tips.includes(e)||this.save.tips.push(e)}updateTips(){if(this.blocked){this.hud.showTip(null);return}let e=e=>this.save.tips.includes(e),t=e=>this.save.tips.includes(`pending:${e}`),n=sl();if(!e(`move`)){if(this.movedDistance>2)this.markTip(`move`);else return this.hud.showTip(n?`Use the arrow pad to walk, or tap the ground where you want to go.`:`Walk with W A S D or the arrow keys. You can also click the ground.`)}if(this.engine.progress(`practice`).stage===`available`&&!e(`findCarver`)&&this.world===this.hub)return this.target?.kind===`npc`&&this.target.id===`carver`?this.hud.showTip(n?`Tap Talk to speak with Carver.`:`Press E (or click the prompt) to talk to Carver.`):this.hud.showTip(`Follow the arrow to George Washington Carver, beside his greenhouse.`);if(t(`journal`))return this.hud.showTip(n?`Tap Journal to see Carver's quest any time.`:`Your journal (J) keeps track of Carver's quest.`);if(t(`bag`))return this.hud.showTip(n?`New item! Tap Bag to look at it closely.`:`New item! Press I (or click Bag) to look at it closely.`);if(t(`rest`)&&this.world===this.hub)return this.hud.showTip(`Visit your cottage to see your new seed pot. You can rest in bed there.`);this.hud.showTip(null)}async withModalGuard(e){this.input.clear(),this.input.worldActive=!1;let t={close(){},closed:!1};this.modal=t;try{return await e()}finally{this.modal=null,this.input.worldActive=!0}}onAction(e){if(this.running&&!this.title){if(e===`mute`)return this.toggleMute();this.dialogue.isOpen||this.transitioning||this.modal||(e===`interact`?this.interact():e===`journal`?this.openJournal(`quest`):e===`bag`?this.openJournal(`bag`):e===`menu`&&this.openSettingsPanel())}}toggleMute(){Q.unlock(),al({muted:!il.muted}),Y.emit(`toast`,{text:il.muted?`Sound off`:`Sound on`,kind:`info`})}openJournal(e){this.modal||this.dialogue.isOpen||(this.input.clear(),this.input.worldActive=!1,e===`bag`&&this.markTip(`bag`),this.markTip(`journal`),Q.open(),this.modal=Xd(this.uiLayer,{engine:this.engine,save:this.save,mapCanvas:this.hubGroundCanvas,mapSize:{w:this.hub.map.w,h:this.hub.map.h},buildings:this.hub.map.buildings.map(e=>({x:e.x,y:e.y,w:e.w,d:e.d,label:e.label,roof:{red:G.roofRed1,blue:G.roofBlue1,green:G.roofGreen1,brown:G.roofBrown1,glass:G.glass2}[e.roof]})),playerPos:()=>({x:this.player.x,y:this.player.y,scene:this.world.id}),replay:e=>{let t=zc[e],n=t?Object.values(t.nodes)[0].speaker:``;t&&window.setTimeout(()=>void this.runConversation(t,n,!0),0)},findCarver:()=>{this.guideUntil=this.clock+12,Y.emit(`toast`,{text:`Follow the arrow to Carver.`,kind:`hint`})},extraSections:()=>{let e=[];for(let t of[...this.engine.allChapters()].reverse()){let n=this.runtimes.get(t.id)?.journal?.(this.runtimeContext(t.id));n&&e.push(n)}return e},memories:this.save.memories.filter(e=>of[e]).map(e=>({id:e,title:of[e].title,setting:of[e].setting})),openMemory:e=>void this.showMemory(e),onInspect:e=>{let t=this.engine.inventoryEntry(e);t&&!t.inspected&&(this.engine.markInspected(e),this.persist())}},e,()=>{this.modal=null,this.input.worldActive=!0,Q.close(),this.refreshHud()}))}settingsActions(e){return{inGame:e,timePaused:()=>this.save.time.paused,setTimePaused:e=>{this.save.time.paused=e,this.persist()},saveNow:()=>this.persist(),exportSave:()=>this.exportSave(),importSave:e=>this.importSave(e),resetSave:()=>void this.confirmReset(),changeLook:()=>this.openCustomizer(!1),about:()=>e?this.openJournal(`about`):void 0}}openSettingsPanel(){this.modal||this.dialogue.isOpen||(this.input.clear(),this.input.worldActive=!1,Q.open(),this.modal=$d(this.uiLayer,this.settingsActions(!0),()=>{this.modal=null,this.input.worldActive=!0}))}openCustomizer(e){this.modal||(this.input.clear(),this.input.worldActive=!1,this.modal=jd(this.uiLayer,this.save.appearance,{firstTime:e},t=>{this.modal=null,this.input.worldActive=!0,this.save.appearance=t,this.save.customized=!0,this.player.setLook(ec(t)),this.persist(),e&&Y.emit(`toast`,{text:`Welcome to Sweetgum Hollow!`,kind:`info`})}))}async confirmReset(){this.modal?.close(),await this.withModalGuard(()=>kd(this.uiLayer,`Start over?`,`This deletes the progress saved in this browser: your look, items, quests and time. Settings stay the same. This cannot be undone.`,[{id:`keep`,label:`No, keep my progress`},{id:`reset`,label:`Yes, delete and start over`,kind:`danger`}]))===`reset`&&(this.store.reset(),location.reload())}exportSave(){this.persist(`quiet`);let e=this.store.exportText(this.save),t=new Blob([e],{type:`application/json`}),n=URL.createObjectURL(t),r=$(`a`,{href:n,download:`seeds-of-genius-save-day${this.save.time.day}.json`});document.body.append(r),r.click(),r.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),1e3),Y.emit(`toast`,{text:`Save file downloaded.`,kind:`info`})}importSave(e){let t=this.store.importText(e);if(!t.data){Y.emit(`toast`,{text:`That file isn't a Seeds of Genius save (${t.reason}). Nothing was changed.`,kind:`info`});return}this.modal?.close(),this.store.save(t.data),location.reload()}persist(e=`normal`){this.running&&(this.autosaveTimer=0,this.save.world={scene:this.world.id,x:this.player.x,y:this.player.y,facing:this.player.facing},e===`normal`&&Y.emit(`save:status`,{status:`saving`}),!this.store.save(this.save)&&this.store.available?Y.emit(`save:status`,{status:`error`}):this.store.available?e===`normal`&&Y.emit(`save:status`,{status:`saved`}):e===`normal`&&Y.emit(`save:status`,{status:`error`,message:`Saving is off in this browser`}))}teleport(e,t,n=`hub`){n!==this.world.id&&this.setScene(n,{x:e,y:t}),this.player.x=e,this.player.y=t,this.renderer.lookAt(e,t)}setTime(e){this.save.time.minutes=e,this.refreshNpcPresence(),this.updateMood(),this.persist(`quiet`)}debugJumpTo(e){for(let t of this.engine.allChapters()){let n=this.engine.progress(t.id);t.number<e?(n.stage=`complete`,n.rewarded=!0,n.stepsDone=t.steps.map(e=>e.id),t.requiredItems.forEach(e=>this.engine.grantItem(e,`debug`)&&this.engine.useItem(e,`Skipped with debug`))):t.number===e&&t.status===`playable`&&(n.stage=`available`)}this.engine.refreshUnlocks(),this.ensureRuntimes(),this.refreshHud(),this.persist()}debugComplete(){let e=this.engine;e.apply({type:`acceptQuest`,chapterId:`practice`}),e.apply({type:`grantItem`,itemId:`seed_packet`,from:`mae`}),e.apply({type:`completeStep`,chapterId:`practice`,stepId:`get_seeds`}),e.apply({type:`useItem`,itemId:`seed_packet`,usedIn:`Given to Carver to plant`}),e.apply({type:`completeChapter`,chapterId:`practice`}),this.persist()}exposeTestHooks(){let e=window;e.__sog={state:()=>({running:this.running,title:!!this.title,scene:this.world.id,player:this.player?{x:+this.player.x.toFixed(2),y:+this.player.y.toFixed(2),facing:this.player.facing}:null,target:this.target?{kind:this.target.kind,label:this.target.label}:null,dialogueOpen:!!this.dialogue?.isOpen,modalOpen:!!this.modal,objective:this.engine?this.objective().text:void 0,practice:this.engine?.progress(`practice`),chapters:this.engine?Object.fromEntries(this.engine.allChapters().map(e=>[e.id,this.engine.progress(e.id).stage])):{},ch1:this.engine?.progress(`ch1`),ch1Data:this.save.chapterData.ch1??null,ch2:this.engine?.progress(`ch2`),ch2Data:this.save.chapterData.ch2??null,ch3Data:this.save.chapterData.ch3??null,memories:this.save.memories,runtimesReady:this.runtimesReady,version:this.save.version,inventory:this.save.progress.inventory,xp:this.save.progress.xp,seeds:this.save.progress.seeds,time:this.save.time,appearance:this.save.appearance,learner:this.save.learner,internal:{w:this.renderer.internalW,h:this.renderer.internalH,scale:this.renderer.scale}}),project:(e,t)=>this.renderer.project(new z(e,0,t*Z)),...this.debug?{teleport:(e,t,n)=>this.teleport(e,t,n),setTime:e=>this.setTime(e)}:{}}}};function mf(e){return new Promise(t=>setTimeout(t,e))}function hf(e,t,n,r){let i=n-e,a=r-t;return Math.abs(i)>Math.abs(a)?i>0?`right`:`left`:a>0?`down`:`up`}function gf(e,t,n){let r=Math.hypot(t,n)||1,i={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[e];return(i[0]*t+i[1]*n)/r}function _f(e,t){return e.kind===t.kind?e.kind===`sign`&&t.kind===`sign`?e.text===t.text:e.id===t.id:!1}function vf(e){if(e.id===`carver`)return`Carver`;let t=e.name.split(` `);return/^(Mr|Ms|Mrs|Dr)\.$/.test(t[0])?`${t[0]} ${t[t.length-1]}`:t[0]}function yf(){let e=document.getElementById(`app`);try{new pf(e).start()}catch(t){console.error(t),e.innerHTML=`<div class="screen"><div class="panel title-card"><h1>Seeds of Genius</h1><p>Sorry, this browser could not start the game. It needs WebGL, which is available in current Chrome, Edge, Safari and Firefox.</p></div></div>`}}yf();export{$ as a,il as c,Od as i,q as l,Id as n,ud as o,Fd as r,iu as s,Kd as t,J as u};