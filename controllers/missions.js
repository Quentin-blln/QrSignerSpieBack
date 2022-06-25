import User from '../models/user.js';
import Mission from '../models/mission.js';
import Missions_contributor from '../models/missions_contributor.js';
import Missions_supervisor from '../models/missions_supervisor.js';
import sequelize from '../utils/database.js';


const getAllMissions = (req, res, next) => {
    User.findOne({ where : {
        id: req.query.userID, 
    }}).then(user=>{
        if(user.isAdmin){
            Mission.findAll({ where: {
                isDone:0,
            }}).then(missions=>{
                res.status(200).json({missions: missions})
            })
        }
        else{
            res.status(401).json({message:"401: You are not allowed to do that."})
        }
    })
}

const getDoneMissions = (req, res, next) => {
    User.findOne({ where : {
        id: req.query.userID, 
    }}).then(user=>{
        if(user.isAdmin){
            Mission.findAll({ where: {
                isDone:1,
            }}).then(missions=>{
                res.status(200).json({missions: missions})
            })
        }
        else{
            res.status(401).json({message:"401: You are not allowed to do that."})
        }
    })
}

const getSupervisorMissions = (req, res, next) => {
    User.findOne({ where : {
        id: req.query.userID, 
    }}).then(user=>{
        sequelize.query(
            `select * from missions
            inner join missions_supervisors on missions.id = missions_supervisors.mission_id
            where missions_supervisors.user_id = ${user.id} and missions.isDone = 0`, { type: sequelize.QueryTypes.SELECT }
        ).then(missions=>{
            console.log(`Missions de superviseur pour l'utilisateur avec ID ${user.id}: `, missions, missions.length)
            res.status(200).json({missions: missions})
        }).catch(err=>{console.log('Sequelize error: ', err)})
    })
}

const getContributorMissions = (req, res, next) => {
    User.findOne({ where : {
        id: req.query.userID, 
    }}).then(user=>{
        sequelize.query(
            `select * from missions
            inner join missions_contributors on missions.id = missions_contributors.mission_id
            where missions_contributors.user_id = ${user.id} and missions.isDone = 0`, { type: sequelize.QueryTypes.SELECT }
        ).then(missions=>{
            console.log(`Missions de contributeur pour l'utilisateur avec ID ${user.id}: `, missions, missions.length)
            res.status(200).json({missions: missions})
        }).catch(err=>{console.log('Sequelize error: ', err)})
    })
}

const getMissionContributors = (req, res, next) => {
    User.findOne({ where : {
        id: req.query.userID, 
    }}).then(user=>{
        sequelize.query(
            `select * from missions_contributors
            inner join users on users.id = missions_contributors.user_id
            where missions_contributors.mission_id = ${req.query.missionID}`, { type: sequelize.QueryTypes.SELECT }
        ).then(users=>{
            console.log(`Contributors for mission with ID ${req.query.missionID}: `, users, users.length)
            res.status(200).json({users: users})
        })
    })
}

const getMissionSupervisors = (req, res, next) => {
    User.findOne({ where : {
        id: req.query.userID, 
    }}).then(user=>{
        sequelize.query(
            `select * from missions_supervisors
            inner join users on users.id = missions_supervisors.user_id
            where missions_supervisors.mission_id = ${req.query.missionID}`, { type: sequelize.QueryTypes.SELECT }
        ).then(users=>{
            console.log(`Supervisors for mission with ID ${req.query.missionID}: `, users, users.length)
            res.status(200).json({users: users})
        })
    })
}

const setMissionDone = (req, res, next) => {
    User.findOne({ where : {
        id: req.body.supervisorID, 
    }}).then(user=>{
        Mission.update(
            {
                isDone:true,
                doneSupervisor: user.id,
                doneContributor: req.body.contributorID,
                doneComment: req.body.comment
            },
            {
                where:{id:req.body.missionID}
            }
        ).then(mission=>{
            if(mission[0]==1){
                res.status(200).json({message:"200: Mission validated."})
            }
            else{
                res.status(401).json({message:"401: Mission couldnt be validated."})
            }
        }).catch(err=>{console.log('Error while tryin to validate a mission: ', err)})
    })
}

const postNewMission = (req, res, next) => {
    User.findOne({ where : {
        email: req.body.email, 
    }}).then(user=>{
        if(user.isAdmin){
            Mission.create({
                name: req.body.name,
                description: req.body.description,
                company_name: req.body.company_name,
                company_location: req.body.company_location,
                company_contact: req.body.company_contact,
                date: new Date(req.body.date).toISOString()
            }).then((mission)=>{
                console.log("MISSION LOG: ",mission)
                for(let usr of req.body.supervisors){
                    Missions_supervisor.create({
                        mission_id: mission.id,
                        user_id: usr
                    }).catch(err=>{console.log(err);res.status(500).json({message:"500: Couldnt link mission to supervisor."})})
                }
                for(let usr of req.body.contributors){
                    Missions_contributor.create({
                        mission_id: mission.id,
                        user_id: usr
                    }).catch(err=>{console.log(err);res.status(500).json({message:"500: Couldnt link mission to contributor."})})
                }
                res.status(200).json({message:"200: Mission successfully created."})
            }).catch(err=>{console.log(err);res.status(500).json({message:"500: Coulnt create new mission."})})
        }else{res.status(401).json({message:"401: You are not allowed to do that."})}
    }).catch(err=>{console.log(err);res.status(500).json({message:"500: Coulnt check user."})})
}

const postEditMission = (req, res, next) => {
    User.findOne({ where : {
        email: req.body.email, 
    }}).then(user=>{
        if(user.isAdmin){
            Mission.update({
                name: req.body.name,
                description: req.body.description,
                company_name: req.body.company_name,
                company_location: req.body.company_location,
                company_contact: req.body.company_contact,
                date: new Date(req.body.date).toISOString()
            },
            {
                where:{id: req.body.missionID}
            }).then((mission)=>{
                console.log("MISSION LOG: ",mission)

                //FILTER SUPERVISORS
                for(let usr of req.body.supervisors){
                    if(req.body.oldSupervisors.length>0){
                        let found = req.body.oldSupervisors.find(e=>{e===usr})
                        if(found){
                            req.body.supervisors.filter(e=>{e!==found})
                            req.body.oldSupervisors.filter(e=>{e!==found})
                        }
                    }
                }
                //ADD NEW SUPERVISORS TO MISSION
                for(let usr of req.body.supervisors){
                    Missions_supervisor.create({
                        mission_id: req.body.missionID,
                        user_id : usr
                    }).catch(err=>{console.log(err);res.status(500).json({message:"500: Couldnt link mission to supervisor."})})
                }
                //DELETE OLD SUPERVISORS
                for(let usr of req.body.oldSupervisors){
                    Missions_supervisor.destroy({
                        where: { 
                            mission_id: req.body.missionID,
                            user_id : usr
                            }
                    }).catch(err=>{console.log(err);res.status(500).json({message:"500: Couldnt delete mission supervisor."})})
                }

                //FILTER CONTRIBUTORS
                for(let usr of req.body.contributors){
                    if(req.body.oldContributors.length>0){
                        let found = req.body.oldContributors.find(e=>{e===usr})
                        if(found){
                            req.body.contributors.filter(e=>{e!==found})
                            req.body.oldContributors.filter(e=>{e!==found})
                        }
                    }
                }
                //ADD NEW CONTRIBUTORS TO MISSION
                for(let usr of req.body.contributors){
                    Missions_contributor.create({
                        mission_id: req.body.missionID,
                        user_id : usr
                    }).catch(err=>{console.log(err);res.status(500).json({message:"500: Couldnt link mission to contributor."})})
                }
                //DELETE OLD CONTRIBUTORS
                for(let usr of req.body.oldContributors){
                    Missions_contributor.destroy({
                        where: { 
                            mission_id: req.body.missionID,
                            user_id : usr
                            }
                    }).catch(err=>{console.log(err);res.status(500).json({message:"500: Couldnt link mission to contributor."})})
                }
                res.status(200).json({message:"200: Mission successfully edited."})
            }).catch(err=>{console.log(err);res.status(500).json({message:"500: Coulnt create new mission."})})
        }else{res.status(401).json({message:"401: You are not allowed to do that."})}
    }).catch(err=>{console.log(err);res.status(500).json({message:"500: Coulnt check user."})})
}

const deleteMission = (req, res, next) => {
    User.findOne({ where : {
        email: req.body.email, 
    }}).then(user=>{
        if(user.isAdmin){
            Missions_contributor.destroy({
                where:{
                    mission_id: req.body.missionID
                }}).then(()=>{
                    Missions_supervisor.destroy({
                        where:{
                            mission_id: req.body.missionID
                        }}).then(()=>{
                            Mission.destroy({
                                where:{
                                    id: req.body.missionID
                                }
                            }).then(()=>{
                                res.status(200).json({message:"200: Mission deleted successfully."})
                            }).catch(err=>{console.log(err);res.status(500).json({message:"500: Couldnt delete this mission."})})
                        }).catch(err=>{console.log(err);res.status(500).json({message:"500: Couldnt delete supervisors linked to this mission."})})
                }).catch(err=>{console.log(err);res.status(500).json({message:"500: Couldnt delete contributors linked to this mission."})})
        }else{res.status(401).json({message:"401: You are not allowed to do that."})}
    }).catch(err=>{console.log(err);res.status(500).json({message:"500: Coulnt delete mission."})})
}

export {getAllMissions, getDoneMissions, getSupervisorMissions, getContributorMissions, getMissionContributors, getMissionSupervisors, setMissionDone, postNewMission, postEditMission, deleteMission};