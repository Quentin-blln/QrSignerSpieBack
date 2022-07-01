import express from 'express';

import { signup, login, isAuth, addUserToCreate, checkEmailToCreateUser, forgotPassword, updatePassword, getAllUsers, getUser, getUserById, deactivateUser, activateUser, updateUserPhoneNumber } from '../controllers/auth.js';
import { getAllMissions, getDoneMissions, getSupervisorMissions, getContributorMissions, getMissionContributors, getMissionSupervisors, setMissionDone, postNewMission, postEditMission, deleteMission, getSignatures, getSignaturesAll } from '../controllers/missions.js';

const router = express.Router();

router.post('/login', login);

router.post('/signup', signup);

router.get('/private', isAuth);

router.get('/allmissions', getAllMissions);

router.get('/alldonemissions', getDoneMissions);

router.get('/supervisormissions', getSupervisorMissions)

router.get('/contributormissions', getContributorMissions)

router.get('/missionsupervisors', getMissionSupervisors)

router.get('/missioncontributors', getMissionContributors)

router.post('/missiondone', setMissionDone)

router.post('/addusertocreate', addUserToCreate)

router.get('/checkemailtocreateuser', checkEmailToCreateUser)

router.post('/forgotpassword', forgotPassword)

router.post('/updatepassword', updatePassword)

router.get('/allusers', getAllUsers)

router.post('/newmission', postNewMission)

router.post('/editmission', postEditMission)

router.post('/deletemission', deleteMission)

router.get('/user', getUser)

router.get('/userId', getUserById)

router.get('/signatures', getSignatures)

router.get('/allsignatures', getSignaturesAll)

router.post('/deactivateuser', deactivateUser)

router.post('/activateuser', activateUser)

router.post('/updatephonenumber', updateUserPhoneNumber)

router.get('/public', (req, res, next) => {
    res.status(200).json({ message: "here is your public resource" });
});

// will match any other path
router.use('/', (req, res, next) => {
    res.status(404).json({error : "page not found"});
});

export default router;