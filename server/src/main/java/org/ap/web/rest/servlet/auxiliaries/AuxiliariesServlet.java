package org.ap.web.rest.servlet.auxiliaries;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.ws.rs.Path;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.core.SecurityContext;

import org.ap.web.entity.mongo.AuxiliaryBean;
import org.ap.web.entity.mongo.CredentialsBean;
import org.ap.web.entity.mongo.CustomerBean;
import org.ap.web.entity.mongo.IndisponibilityBean;
import org.ap.web.entity.mongo.InterventionBean;
import org.ap.web.entity.mongo.OfferBean;
import org.ap.web.entity.mongo.QuestionaryBean;
import org.ap.web.entity.mongo.ServiceBean;
import org.ap.web.entity.mongo.SkillsBean;
import org.ap.web.internal.APException;
import org.ap.web.rest.servlet.ServletBase;
import org.ap.web.service.stores.auxiliaries.AuxiliariesStore;
import org.ap.web.service.stores.auxiliaries.IAuxiliariesStore;
import org.ap.web.service.stores.customers.CustomersStore;
import org.ap.web.service.stores.customers.ICustomersStore;
import org.ap.web.service.stores.indisponibilities.IIndisponibilitiesStore;
import org.ap.web.service.stores.indisponibilities.IndisponibilitiesStore;
import org.ap.web.service.stores.interventions.IInterventionsStore;
import org.ap.web.service.stores.interventions.InterventionsStore;
import org.ap.web.service.stores.offers.IOffersStore;
import org.ap.web.service.stores.offers.OffersStore;
import org.ap.web.service.stores.services.IServicesStore;
import org.ap.web.service.stores.services.ServicesStore;

@Path("/auxiliaries")
public class AuxiliariesServlet extends ServletBase implements IAuxiliariesServlet {

	/* STATIC */

	public static final String PATH = "/auxiliaries";  

	/* ATTRIBUTES */

	private IAuxiliariesStore _auxiliaryStore;
	private IServicesStore _servicesStore;
	private ICustomersStore _customersStore;
	private IOffersStore _offersStore;
	private IInterventionsStore _interventionsStore;
	private IIndisponibilitiesStore _indiponibilitiesStore;

	/* CONSTRUCTOR */

	public AuxiliariesServlet() throws APException {
		_auxiliaryStore = new AuxiliariesStore();
		_servicesStore = new ServicesStore();
		_offersStore = new OffersStore();
		_customersStore = new CustomersStore();
		_interventionsStore = new InterventionsStore();
		_indiponibilitiesStore = new IndisponibilitiesStore();
	}

	/* METHODS */

	@Override
	public Response getAuxiliariesJSON(SecurityContext sc) {
		try {
			AuxiliaryBean[] users = _auxiliaryStore.get();
			return Response.status(200).entity(users, resolveAnnotations(sc)).build();
		} catch (APException e) {
			return sendException(e);
		}
	}
	@Override
	public Response createAuxiliaryJSON(SecurityContext sc, CredentialsBean bean) {
		try {
			AuxiliaryBean auxiliary = _auxiliaryStore.create(bean);
			return Response.status(Status.CREATED).entity(auxiliary, resolveAnnotations(sc, auxiliary)).build();
		} catch (APException e) {
			return sendException(e);
		}
	}
	@Override
	public Response getAuxiliaryJSON(SecurityContext sc, String auxiliaryId) {
		try {
			AuxiliaryBean bean = _auxiliaryStore.get(auxiliaryId);
			if (bean == null) throw APException.AUXILIARY_NOT_FOUND;
			return Response.status(Status.OK).entity(bean, resolveAnnotations(sc, bean)).build();
		} catch (APException e) {
			return sendException(e);
		}
	}
	@Override
	public Response updateAuxiliaryJSON(SecurityContext sc, String auxiliaryId, AuxiliaryBean auxiliary) {
		try {
			if (!sc.getUserPrincipal().getName().equals(auxiliaryId)) throw APException.AUXILIARY_NOT_FOUND;
			if (!auxiliary.getId().equals(auxiliaryId)) throw APException.AUXILIARY_INVALID;
			auxiliary = _auxiliaryStore.update(auxiliary);
			return Response.status(Status.OK).entity(auxiliary, resolveAnnotations(sc, auxiliary)).build();
		} catch (APException e) {
			return sendException(e);
		}
	}
	@Override
	public Response deleteAuxiliaryJSON(SecurityContext sc, String auxiliaryId) {
		try {
			_auxiliaryStore.delete(auxiliaryId);
			return Response.status(Status.OK).build();
		} catch (APException e) {
			return sendException(e);
		}
	}
	
	@Override
	public Response postQuestionaryJSON(SecurityContext sc, String auxiliaryId, QuestionaryBean questionary) {
		try {
			if (!sc.getUserPrincipal().getName().equals(auxiliaryId)) throw APException.AUXILIARY_NOT_FOUND;
			AuxiliaryBean auxiliary = _auxiliaryStore.get(auxiliaryId);
			if (!auxiliary.getId().equals(auxiliaryId)) throw APException.AUXILIARY_INVALID;
			SkillsBean skills = computeSkills(questionary);
			auxiliary.setSkills(skills);
			auxiliary = _auxiliaryStore.update(auxiliary);
			return Response.status(Status.OK).entity(skills, resolveAnnotations(sc)).build();
		} catch (APException e) {
			return sendException(e);
		}
	}
	private SkillsBean computeSkills(QuestionaryBean questionary) {
		SkillsBean result = new SkillsBean();
		result.setHousework(questionary.getAnswer0());
		result.setNursing(questionary.getAnswer1());
		result.setChildhood(questionary.getAnswer2());
		result.setShopping(questionary.getAnswer3());
		result.setCompagny(questionary.getAnswer4());
		result.setAdministrative(questionary.getAnswer5());
		result.setDoityourself(questionary.getAnswer6());
		return result;
	}
	@Override
	public Response getServicesJSON(SecurityContext sc, String auxiliaryId) {
		try {
			if (!sc.getUserPrincipal().getName().equals(auxiliaryId)) throw APException.AUXILIARY_NOT_FOUND;			
			Set<String> servicesIds = new HashSet<String>();
			InterventionBean[] interventions = _interventionsStore.getAuxiliaryInterventions(auxiliaryId);
			for (InterventionBean intervention: interventions) {
				servicesIds.add(intervention.getServiceId());
			}
			OfferBean[] offers = _offersStore.getAuxiliaryOffers(auxiliaryId);
			for (OfferBean offer: offers) {
				servicesIds.add(offer.getServiceId());
			}
			Map<String, ServiceBean> services = _servicesStore.get(servicesIds);
			ServiceBean[] result = services.values().toArray(new ServiceBean[services.size()]);
			return Response.status(Status.OK).entity(result, resolveAnnotations(sc)).build();
		} catch (APException e) {
			return sendException(e);
		}
	}
	@Override
	public Response getCustomersJSON(SecurityContext sc, String auxiliaryId) {
		try {
			if (!sc.getUserPrincipal().getName().equals(auxiliaryId)) throw APException.AUXILIARY_NOT_FOUND;			
			Set<String> customerIds = new HashSet<String>();
			InterventionBean[] interventions = _interventionsStore.getAuxiliaryInterventions(auxiliaryId);
			for (InterventionBean intervention : interventions) {
				customerIds.add(intervention.getCustomerId());
			}
			OfferBean[] offers = _offersStore.getAuxiliaryOffers(auxiliaryId);
			for (OfferBean offer: offers) {
				customerIds.add(offer.getCustomerId());
			}
			Map<String, CustomerBean> customers = _customersStore.get(customerIds);
			CustomerBean[] result = customers.values().toArray(new CustomerBean[customers.size()]);
			return Response.status(Status.OK).entity(result, resolveAnnotations(sc)).build();
		} catch (APException e) {
			return sendException(e);
		}
	}
	@Override
	public Response getInterventionsJSON(SecurityContext sc, String auxiliaryId) {
		try {
			if (!sc.getUserPrincipal().getName().equals(auxiliaryId)) throw APException.AUXILIARY_NOT_FOUND;
			Set<String> interventionsIds = new HashSet<String>();
			OfferBean[] offers = _offersStore.getAuxiliaryOffers(auxiliaryId);
			for (OfferBean offer : offers) {
				interventionsIds.add(offer.getInterventionId());
			}
			InterventionBean[] interventions = _interventionsStore.getAuxiliaryInterventions(auxiliaryId);
			for (InterventionBean inter: interventions) {
				interventionsIds.add(inter.getId());
			}
			Map<String, InterventionBean> resultMap = _interventionsStore.get(interventionsIds);
			InterventionBean[] result = resultMap.values().toArray(new InterventionBean[resultMap.size()]);
			return Response.status(Status.OK).entity(result, resolveAnnotations(sc)).build();
		} catch (APException e) {
			return sendException(e);
		}
	}
	@Override
	public Response getOffersJSON(SecurityContext sc, String auxiliaryId) {
		try {
			if (!sc.getUserPrincipal().getName().equals(auxiliaryId)) throw APException.AUXILIARY_NOT_FOUND;
			OfferBean[] offers = _offersStore.getAuxiliaryOffers(auxiliaryId);
			return Response.status(Status.OK).entity(offers, resolveAnnotations(sc)).build();
		} catch (APException e) {
			return sendException(e);
		}
	}
	@Override
	public Response getIndisponibilitiesJSON(SecurityContext sc, String auxiliaryId) {
		try {
			if (!sc.getUserPrincipal().getName().equals(auxiliaryId)) throw APException.AUXILIARY_NOT_FOUND;
			IndisponibilityBean[] indisponibilities = _indiponibilitiesStore.getAuxIndisponibilities(auxiliaryId);
			return Response.status(Status.OK).entity(indisponibilities, resolveAnnotations(sc)).build();
		} catch (APException e) {
			return sendException(e);
		}
	}
}