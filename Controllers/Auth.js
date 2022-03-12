const {auth} = require('../Models/Auth')
const loginStudent = async ()=>
{
    const {email, password} = req.body;
    const data = {email, password};

    const resultFromJoi = adminValidator('email password', data);

    if(!resultFromJoi)
    {
        res.status(200).json(
            {
                status: false,
                message: "Invalid Credential Details",
                Note: "email must be email and password must be 8 characters long"
            }
        )
    }
    else 
    {
      try {

        const admin = await Admin.findOne({email: email});
        if(!admin)
        {
            res.status(200).json(
                {
                    status: false,
                    message: "User not Found"
                }
            )
        }
        else{
            const passVerifier = await verifyPass(password, admin.password);

            if(!passVerifier)
            {
                res.status(200).json(
                    {
                        status: false,
                        message: "Invalid Username or password"
                    }
                )
            }
            else 
            {
                const newJWT =await generateJWT(admin);
            if(!newJWT)
            {
                res.status(200).json(
                    {
                        status: false,
                        message: "JWT Not Created",
                      
                    }
                )
            }
            else 
            {
                res.status(200).json(
                    {
                        status: true,
                        message: "Login Successful",
                        accessToken: newJWT,
                        user: admin
                    }
                )
            }
        }



            }
            
          
      } catch (error) {
          
        console.log(error);
      } 
            

        
        
    }
    

}
//signup student 
const signupStudent = async (req, res) =>
{
    const {userName, email, password} = req.body;

    const resultFromJoi = await adminValidator('userName email password', req.body);
    if(!resultFromJoi)
    {
        res.status(200).json(
            {
                status: false,
                message: "Invalid Credential Details",
                email: "Email must be email",
                userName: "Username must be atleast 3 characters long",
                passswod: "Password must be 8 characters Long"
            }
        )
    }
    else 
    {
        try {
            const userFind= await Admin.findOne({$or:[{email: email}, {userName: userName}]});
            if(userFind)
            {
                res.status(200).json(
                    {
                        status: false,
                        message: "User Already Present!!"
                    }
                )
            }
            else 
            {

                const {generateSalt, generateHash} = await passwordHash(password);
                if(!generateHash)
                {
                    res.status(200).json(

                        {
                            status: false,
                            message: "Password is not Hashed"
                        }
                    )
                }
                else 
                {
                    const referralGen = referralCode();
                    const newUser = await new Admin(
                        {
                            userName:userName,
                            email: email,
                            password: generateHash,
                            salt: generateSalt,
                            referral: referralGen,
                            typeUser: 2

                        }
                    )
                    if(!newUser)
                    {
                        res.status(200).json(
                            
                            {
                                stautus: false,
                                message: "User not Created"
                            }
                        )
                    }
                    else 
                    {
                        const referralData = await new Referral(
                            {
                                userID: newUser._id,
                                referralCode: referralGen,
                                email: email,
                                userType: 2,
                                commisionPercent: 50
                            }
                        )

                        if(!referralData)
                        {
                            res.status(200).json(
                                {
                                    status: false,
                                    message: "Referral Data is not Generated"
                                }
                            )
                        }
                        else 
                        {
                            const wallet = await new Wallet(
                                {
                                    userID: newUser._id,
                                    userType: 2
                                }
                            )
                            if(!wallet)
                            {
                                res.status(200).json(
                                    {
                                        status: false,
                                        message: "Wallet is not generated"
                                    }
                                )
                            }
                            else 
                            {
                                await newUser.save();
                                await referralData.save();
                                await wallet.save();
                                res.status(200).json(
                                    {
                                        status: true,
                                        message: "User Is Created!",
                                        userName: newUser.userName,
                                        email: newUser.email,
                                        referral: newUser.referral,
                                        accessToken: generateJWT(newUser)

                                    }
                                )
                                

                            }
                        }
                    }
                }
                

            }
            
        } catch (error) {
            
            console.log(error);
        }
    }


}

const test = (req,res) =>
{
    res.send('Helllo world');
    
}
module.exports = 
{
    loginStudent,
    signupStudent
}