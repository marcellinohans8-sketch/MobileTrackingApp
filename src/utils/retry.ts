export async function retryQueue(
fn:any,
retry=5
){


let delay=1000;



for(
let i=0;i<retry;i++
){


try{

return await fn();


}catch(e){


await new Promise(
r=>setTimeout(r,delay)
);


delay*=2;


}


}


throw Error(
"Failed after retry"
)


}